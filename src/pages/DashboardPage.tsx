import { useEffect, useMemo, useState } from 'react'
import { LogOut, Sparkles } from 'lucide-react'
import { aiApi } from '../api/aiApi'
import { billingApi } from '../api/billingApi'
import { ApiError } from '../api/httpClient'
import { usageApi } from '../api/usageApi'
import { ChatMessageList } from '../components/chat/ChatMessageList'
import { PromptComposer } from '../components/chat/PromptComposer'
import { UsageHistoryChart } from '../components/history/UsageHistoryChart'
import { QuotaIndicator } from '../components/quota/QuotaIndicator'
import { RateLimitIndicator } from '../components/quota/RateLimitIndicator'
import { PlanBadge } from '../components/shared/PlanBadge'
import { UpgradeModal } from '../components/shared/UpgradeModal'
import { useAuth } from '../hooks/useAuth'
import type { PlanType, QuotaStatusResponse, RateLimitErrorDetails, UsageHistoryItem } from '../types/api'
import type { ChatMessage } from '../types/chat'
import { estimatePromptTokens } from '../utils/tokenEstimator'

interface QuotaUiState {
  plan: PlanType
  usedTokens: number
  remainingTokens: number | null
  tokenLimit: number | null
  monthlyQuotaExhausted: boolean
  resetDate: string
}

const PLAN_REQUEST_LIMITS: Record<PlanType, number> = {
  FREE: 10,
  PRO: 30,
  ENTERPRISE: 120
}

const createInitialHistory = (): UsageHistoryItem[] => {
  const items: UsageHistoryItem[] = []
  const now = new Date()

  for (let index = 6; index >= 0; index -= 1) {
    const date = new Date(now)
    date.setDate(now.getDate() - index)
    items.push({
      date: date.toISOString().slice(0, 10),
      tokensUsed: 0
    })
  }

  return items
}

const normalizeQuota = (status: QuotaStatusResponse): QuotaUiState => {
  const tokenLimit = status.remainingTokens === null ? null : status.usedTokens + status.remainingTokens

  return {
    plan: status.currentPlan,
    usedTokens: status.usedTokens,
    remainingTokens: status.remainingTokens,
    tokenLimit,
    monthlyQuotaExhausted: status.remainingTokens !== null && status.remainingTokens <= 0,
    resetDate: status.resetDate
  }
}

const pruneOldRequests = (timestamps: number[], now: number): number[] => timestamps.filter((stamp) => now - stamp < 60_000)

const computeResetInSeconds = (timestamps: number[], now: number): number => {
  if (timestamps.length === 0) {
    return 0
  }

  const oldest = Math.min(...timestamps)
  return Math.max(0, 60 - Math.floor((now - oldest) / 1000))
}

export const DashboardPage = () => {
  const { user, credentials, logout } = useAuth()
  const [quota, setQuota] = useState<QuotaUiState | null>(null)
  const [history, setHistory] = useState<UsageHistoryItem[]>(createInitialHistory)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [prompt, setPrompt] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSending, setIsSending] = useState(false)
  const [isUpgradeOpen, setIsUpgradeOpen] = useState(false)
  const [isUpgrading, setIsUpgrading] = useState(false)
  const [requestTimestamps, setRequestTimestamps] = useState<number[]>([])
  const [forcedCooldownSeconds, setForcedCooldownSeconds] = useState(0)
  const [rateLimitOverride, setRateLimitOverride] = useState<number | null>(null)
  const [now, setNow] = useState(Date.now())

  const estimatedTokens = useMemo(() => estimatePromptTokens(prompt), [prompt])
  const activeRequestTimestamps = useMemo(() => pruneOldRequests(requestTimestamps, now), [requestTimestamps, now])

  const requestsPerMinuteUsed = activeRequestTimestamps.length
  const requestsPerMinuteLimit = rateLimitOverride ?? PLAN_REQUEST_LIMITS[quota?.plan ?? user?.plan ?? 'FREE']
  const naturalResetInSeconds = computeResetInSeconds(activeRequestTimestamps, now)
  const rateLimitResetInSeconds = forcedCooldownSeconds > 0 ? forcedCooldownSeconds : naturalResetInSeconds

  const isRateLimited =
    (requestsPerMinuteUsed >= requestsPerMinuteLimit && rateLimitResetInSeconds > 0) || forcedCooldownSeconds > 0

  useEffect(() => {
    const interval = window.setInterval(() => {
      setNow(Date.now())
      setRequestTimestamps((previous) => pruneOldRequests(previous, Date.now()))
      setForcedCooldownSeconds((previous) => Math.max(0, previous - 1))
    }, 1000)

    return () => window.clearInterval(interval)
  }, [])

  useEffect(() => {
    if (!credentials) {
      setError('No hay sesion activa. Inicia sesion nuevamente.')
      return
    }

    const loadDashboardData = async () => {
      try {
        const [statusData, historyData] = await Promise.all([
          usageApi.getStatus(credentials),
          usageApi.getHistory(credentials)
        ])
        const mappedQuota = normalizeQuota(statusData)

        setQuota(mappedQuota)
        setHistory(historyData.length > 0 ? historyData : createInitialHistory())

        if (mappedQuota.monthlyQuotaExhausted) {
          setIsUpgradeOpen(true)
        }
      } catch (loadError) {
        if (loadError instanceof ApiError) {
          setError(loadError.message)
        } else {
          setError('No se pudieron cargar estado y metricas de consumo.')
        }
      }
    }

    void loadDashboardData()
  }, [credentials])

  const blockReason = quota?.monthlyQuotaExhausted
    ? 'La cuota mensual esta agotada. Realiza upgrade para continuar.'
    : isRateLimited
      ? `Rate limit alcanzado. Espera ${rateLimitResetInSeconds} segundos.`
      : null

  const handleSendPrompt = async () => {
    if (!credentials || !quota) {
      setError('El estado de uso no esta disponible todavia.')
      return
    }

    const normalizedPrompt = prompt.trim()
    if (!normalizedPrompt) {
      setError('Ingresa un prompt antes de enviar.')
      return
    }

    if (quota.monthlyQuotaExhausted) {
      setIsUpgradeOpen(true)
      return
    }

    if (isRateLimited) {
      return
    }

    setError(null)
    setIsSending(true)
    const requestAt = Date.now()
    setRequestTimestamps((previous) => [...pruneOldRequests(previous, requestAt), requestAt])

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: normalizedPrompt,
      createdAt: new Date().toISOString(),
      tokens: estimatedTokens
    }

    setMessages((previous) => [...previous, userMessage])

    try {
      const response = await aiApi.generate({
        userId: credentials.userId,
        encryptedPassword: credentials.encryptedPassword,
        prompt: normalizedPrompt,
        requestedTokens: estimatedTokens
      })

      const assistantMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: response.generatedText,
        createdAt: new Date().toISOString(),
        tokens: response.tokensConsumed
      }

      setMessages((previous) => [...previous, assistantMessage])

      const [latestStatus, latestHistory] = await Promise.all([
        usageApi.getStatus(credentials),
        usageApi.getHistory(credentials)
      ])
      const mappedQuota = normalizeQuota(latestStatus)

      setQuota(mappedQuota)
      setHistory(latestHistory.length > 0 ? latestHistory : createInitialHistory())
      setPrompt('')

      if (mappedQuota.monthlyQuotaExhausted) {
        setIsUpgradeOpen(true)
      }
    } catch (sendError) {
      if (sendError instanceof ApiError) {
        if (sendError.status === 429) {
          const details = (sendError.details ?? {}) as RateLimitErrorDetails
          setRateLimitOverride(details.maxRequestsPerMinute ?? null)
          setForcedCooldownSeconds(sendError.retryAfterSeconds ?? 60)
        }

        if (sendError.status === 402) {
          setQuota((previous) => {
            if (!previous) {
              return previous
            }

            return {
              ...previous,
              monthlyQuotaExhausted: true,
              remainingTokens: 0
            }
          })
          setIsUpgradeOpen(true)
        }

        setError(sendError.message)
      } else {
        setError('No se pudo procesar el prompt. Intenta de nuevo.')
      }
    } finally {
      setIsSending(false)
    }
  }

  const handleUpgrade = async (payload: { cardholderName: string; cardNumberMasked: string }) => {
    void payload

    if (!credentials) {
      setError('No hay sesion activa para hacer upgrade.')
      return
    }

    setIsUpgrading(true)
    setError(null)

    try {
      const response = await billingApi.upgradePlan({
        userId: credentials.userId,
        encryptedPassword: credentials.encryptedPassword,
        targetPlan: 'PRO'
      })

      setQuota(normalizeQuota(response))
      setRateLimitOverride(PLAN_REQUEST_LIMITS[response.currentPlan])
      setIsUpgradeOpen(false)
    } catch (upgradeError) {
      if (upgradeError instanceof ApiError) {
        setError(upgradeError.message)
      } else {
        setError('Error en la simulacion de pago. Intenta nuevamente.')
      }
    } finally {
      setIsUpgrading(false)
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 md:px-8">
      <div className="mx-auto w-full max-w-7xl space-y-5">
        <header className="flex flex-col gap-3 border border-slate-200 bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-600">Taller frontend</p>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900 md:text-3xl">Panel de consumo IA</h1>
            <div className="flex items-center gap-3 text-sm text-slate-700">
              <span>{user?.userId}</span>
              {(quota?.plan ?? user?.plan) && <PlanBadge plan={quota?.plan ?? user?.plan ?? 'FREE'} />}
            </div>
          </div>

          <button
            onClick={logout}
            type="button"
            className="inline-flex items-center gap-2 self-start border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
          >
            <LogOut className="h-4 w-4" />
            Cerrar sesion
          </button>
        </header>

        {error && <p className="border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

        <section className="grid gap-4 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-2">
            <div className="flex items-center gap-2 border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 shadow-sm">
              <Sparkles className="h-4 w-4 text-brand-600" />
              Interfaz chat para prompts con control de cuota y rate limit.
            </div>

            <ChatMessageList messages={messages} />
            <PromptComposer
              prompt={prompt}
              estimatedTokens={estimatedTokens}
              isSending={isSending}
              isBlocked={Boolean(blockReason)}
              blockReason={blockReason}
              onPromptChange={setPrompt}
              onSubmit={handleSendPrompt}
            />
          </div>

          <aside className="space-y-4">
            <QuotaIndicator usedTokens={quota?.usedTokens ?? 0} tokenLimit={quota?.tokenLimit ?? 0} />
            <RateLimitIndicator
              used={requestsPerMinuteUsed}
              limit={requestsPerMinuteLimit}
              resetInSeconds={rateLimitResetInSeconds}
            />
            <UsageHistoryChart data={history} />
            <section className="border border-slate-200 bg-white p-4 text-xs text-slate-600 shadow-sm">
              Reset mensual: {quota?.resetDate ?? 'N/A'}
            </section>
          </aside>
        </section>
      </div>

      <UpgradeModal
        isOpen={isUpgradeOpen}
        isSubmitting={isUpgrading}
        onClose={() => setIsUpgradeOpen(false)}
        onConfirm={handleUpgrade}
      />
    </main>
  )
}
