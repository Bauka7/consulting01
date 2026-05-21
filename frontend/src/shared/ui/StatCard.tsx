import type { LucideIcon } from 'lucide-react'

interface Props {
  title: string
  value: string | number
  icon: LucideIcon
  color?: string
  trend?: { value: number; label: string }
}

export function StatCard({ title, value, icon: Icon, color = '#E63946', trend }: Props) {
  return (
    <div className="card p-5">
      <div className="flex items-start justify-between mb-4">
        <p className="text-sm text-[#718096] font-medium">{title}</p>
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: color + '18' }}
        >
          <Icon className="w-5 h-5" style={{ color }} />
        </div>
      </div>
      <p className="text-3xl font-display font-bold text-[#0C1426]">{value}</p>
      {trend && (
        <p className={`text-xs mt-1.5 ${trend.value >= 0 ? 'text-teal-600' : 'text-[#E63946]'}`}>
          {trend.value >= 0 ? '↑' : '↓'} {Math.abs(trend.value)}% {trend.label}
        </p>
      )}
    </div>
  )
}
