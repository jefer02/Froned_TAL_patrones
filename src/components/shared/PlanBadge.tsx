import type { PlanType } from '../../types/api'

interface PlanBadgeProps {
  plan: PlanType
}

const planStyles: Record<PlanType, string> = {
  FREE: 'border-slate-300 bg-slate-100 text-slate-700',
  PRO: 'border-sky-300 bg-sky-100 text-sky-800',
  ENTERPRISE: 'border-emerald-300 bg-emerald-100 text-emerald-800'
}

export const PlanBadge = ({ plan }: PlanBadgeProps) => {
  return <span className={`border px-2 py-1 text-xs font-semibold tracking-wider ${planStyles[plan]}`}>{plan}</span>
}
