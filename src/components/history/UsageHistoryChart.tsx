import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts'
import type { UsageHistoryItem } from '../../types/api'

interface UsageHistoryChartProps {
  data: UsageHistoryItem[]
}

const formatLabel = (date: string): string => {
  const parsed = new Date(`${date}T00:00:00`)
  return parsed.toLocaleDateString('es-CO', { weekday: 'short' })
}

export const UsageHistoryChart = ({ data }: UsageHistoryChartProps) => {
  const chartData = data.map((item) => ({ ...item, day: formatLabel(item.date) }))

  return (
    <section className="border border-slate-200 bg-white p-4 shadow-sm">
      <h3 className="text-sm font-semibold text-slate-900">Historial de uso (ultimos 7 dias)</h3>

      <div className="mt-4 h-56 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" />
            <XAxis dataKey="day" stroke="#475569" fontSize={12} />
            <YAxis stroke="#475569" fontSize={12} />
            <Tooltip />
            <Bar dataKey="tokensUsed" fill="#2563eb" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  )
}
