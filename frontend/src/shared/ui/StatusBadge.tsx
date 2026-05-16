import type { RequestStatus } from '@/entities/request/types'
import { clsx } from 'clsx'

const labels: Record<RequestStatus, string> = {
  PENDING: 'Pending',
  PROGRESS: 'In Progress',
  COMPLETED: 'Completed',
  REJECTED: 'Rejected',
}

const styles: Record<RequestStatus, string> = {
  PENDING: 'bg-amber-100 text-amber-700',
  PROGRESS: 'bg-blue-100 text-blue-700',
  COMPLETED: 'bg-emerald-100 text-emerald-700',
  REJECTED: 'bg-gray-100 text-gray-600',
}

interface Props {
  status: RequestStatus
  className?: string
}

export function StatusBadge({ status, className }: Props) {
  return (
    <span
      className={clsx(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
        styles[status],
        className,
      )}
    >
      {labels[status]}
    </span>
  )
}
