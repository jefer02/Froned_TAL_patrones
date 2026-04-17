interface RateLimitIndicatorProps {
  used: number
  limit: number
  resetInSeconds: number
}

const formatCountdown = (seconds: number): string => {
  const clamped = Math.max(0, seconds)
  const minutes = Math.floor(clamped / 60)
  const remainingSeconds = clamped % 60
  return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`
}

export const RateLimitIndicator = ({ used, limit, resetInSeconds }: RateLimitIndicatorProps) => {
  const blocked = used >= limit && resetInSeconds > 0

  return (
    <section className="border border-slate-200 bg-white p-4 shadow-sm">
      <h3 className="text-sm font-semibold text-slate-900">Requests por minuto</h3>
      <p className="mt-1 text-sm text-slate-700">
        {used} / {limit} solicitudes utilizadas
      </p>
      <p className={`mt-2 text-xs ${blocked ? 'text-red-700' : 'text-slate-600'}`}>
        {blocked
          ? `Rate limit alcanzado. Reintenta en ${formatCountdown(resetInSeconds)}`
          : `Reset del contador en ${formatCountdown(resetInSeconds)}`}
      </p>
    </section>
  )
}
