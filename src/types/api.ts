export type PlanType = 'FREE' | 'PRO' | 'ENTERPRISE'

export interface ApiErrorResponse {
  timestamp: string
  status: number
  code: string
  message: string
  path: string
  details?: Record<string, unknown>
}

export interface User {
  userId: string
  plan: PlanType
}

export interface UserCredentials {
  userId: string
  encryptedPassword: string
}

export interface RegisterUserRequest extends UserCredentials {}

export interface RegisterUserResponse {
  userId: string
  plan: PlanType
  message: string
}

export interface GenerateTextRequest extends UserCredentials {
  prompt: string
  requestedTokens?: number
}

export interface GenerateTextResponse {
  requestId: string
  generatedText: string
  tokensConsumed: number
  plan: PlanType
  remainingTokens: number | null
  createdAt: string
}

export interface UsageHistoryItem {
  date: string
  tokensUsed: number
}

export interface QuotaStatusResponse {
  userId: string
  currentPlan: PlanType
  usedTokens: number
  remainingTokens: number | null
  resetDate: string
}

export interface UpgradePlanRequest extends UserCredentials {
  targetPlan?: 'PRO'
}

export interface UpgradePlanResponse {
  userId: string
  currentPlan: PlanType
  usedTokens: number
  remainingTokens: number | null
  resetDate: string
}

export interface RateLimitErrorDetails {
  plan?: PlanType
  maxRequestsPerMinute?: number
  currentRequests?: number
}
