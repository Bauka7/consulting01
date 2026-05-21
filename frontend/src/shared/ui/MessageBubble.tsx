import { Check, CheckCheck } from 'lucide-react'

interface Props {
  message: string
  isOwn: boolean
  time: string
  isRead?: boolean
  isSystem?: boolean
}

export function MessageBubble({ message, isOwn, time, isRead, isSystem }: Props) {
  if (isSystem) {
    return (
      <div className="flex justify-center my-2">
        <span className="text-xs text-[#718096] bg-[#F5F7FA] border border-[#E8ECF0] px-3 py-1 rounded-full">
          {message}
        </span>
      </div>
    )
  }

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-2`}>
      <div className={`max-w-xs lg:max-w-sm ${isOwn ? 'items-end' : 'items-start'} flex flex-col`}>
        <div className={isOwn ? 'message-out' : 'message-in'}>
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{message}</p>
        </div>
        <div className={`flex items-center gap-1 mt-1 px-1 ${isOwn ? 'justify-end' : 'justify-start'}`}>
          <span className="text-[10px] text-[#718096]">{time}</span>
          {isOwn && (
            isRead
              ? <CheckCheck className="w-3 h-3 text-[#E63946]" />
              : <Check className="w-3 h-3 text-[#718096]" />
          )}
        </div>
      </div>
    </div>
  )
}
