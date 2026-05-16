import { FileX } from 'lucide-react'

interface Props {
  title?: string
  description?: string
}

export function EmptyState({ title = 'No data', description = 'Nothing here yet.' }: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3 text-muted">
      <FileX size={40} className="opacity-40" />
      <p className="font-medium text-sm">{title}</p>
      <p className="text-xs opacity-70">{description}</p>
    </div>
  )
}
