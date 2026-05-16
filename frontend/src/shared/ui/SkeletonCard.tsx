import { clsx } from 'clsx'

interface Props {
  className?: string
  lines?: number
}

export function SkeletonCard({ className, lines = 3 }: Props) {
  return (
    <div className={clsx('bg-card rounded-xl border border-border p-5 animate-pulse', className)}>
      <div className="h-4 bg-gray-200 rounded w-1/3 mb-4" />
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className="h-3 bg-gray-100 rounded mb-2 last:w-2/3" />
      ))}
    </div>
  )
}

export function SkeletonRow() {
  return (
    <tr className="animate-pulse">
      {Array.from({ length: 5 }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <div className="h-3 bg-gray-200 rounded w-24" />
        </td>
      ))}
    </tr>
  )
}
