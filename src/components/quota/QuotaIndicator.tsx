interface QuotaIndicatorProps {
  usedTokens: number
  tokenLimit: number | null
}

export const QuotaIndicator = ({ usedTokens, tokenLimit }: QuotaIndicatorProps) => {
  const isUnlimited = tokenLimit === null
  const percentage = !isUnlimited && tokenLimit > 0 ? Math.min(100, Math.round((usedTokens / tokenLimit) * 100)) : 0

  return (
    <section className="border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-slate-900">Cuota mensual de tokens</h3>
        <span className="text-xs text-slate-600">{isUnlimited ? `${usedTokens} / Ilimitado` : `${usedTokens} / ${tokenLimit}`}</span>
      </div>

      <div className="mt-3 h-3 border border-slate-200 bg-slate-100">
        <div className="h-full bg-brand-600 transition-all" style={{ width: `${isUnlimited ? 100 : percentage}%` }} />
      </div>

      <p className="mt-2 text-xs text-slate-600">{isUnlimited ? 'Plan sin limite mensual.' : `Uso actual: ${percentage}%`}</p>
    </section>
  )
}
