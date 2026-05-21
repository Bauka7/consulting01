import { formatDistanceToNow } from 'date-fns'
import { ru } from 'date-fns/locale'

export interface ChatItem {
  id: string
  name: string
  lastMessage: string
  lastTime: string
  unreadCount: number
  requestProduct?: string
  isOnline?: boolean
}

interface Props {
  chat: ChatItem
  active?: boolean
  onClick: () => void
}

function initials(name: string) {
  return name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase()
}

export function ChatListItem({ chat, active, onClick }: Props) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left flex items-center gap-3 px-4 py-3.5 transition-colors ${
        active ? 'bg-[#FEE2E2]' : 'hover:bg-[#F5F7FA]'
      }`}
    >
      <div className="relative flex-shrink-0">
        <div className="w-10 h-10 rounded-full bg-[#0C1426] flex items-center justify-center text-white text-sm font-semibold">
          {initials(chat.name)}
        </div>
        {chat.isOnline && (
          <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-teal-500 border-2 border-white rounded-full" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-0.5">
          <span className="text-sm font-semibold text-[#0C1426] truncate">{chat.name}</span>
          <span className="text-[10px] text-[#718096] flex-shrink-0 ml-2">
            {formatDistanceToNow(new Date(chat.lastTime), { locale: ru, addSuffix: false })}
          </span>
        </div>
        <p className="text-xs text-[#718096] truncate">{chat.lastMessage}</p>
        {chat.requestProduct && (
          <p className="text-[10px] text-[#718096] italic truncate mt-0.5">
            К заявке: {chat.requestProduct}
          </p>
        )}
      </div>

      {chat.unreadCount > 0 && (
        <span className="flex-shrink-0 w-5 h-5 bg-[#E63946] rounded-full flex items-center justify-center text-white text-[10px] font-bold">
          {chat.unreadCount > 9 ? '9+' : chat.unreadCount}
        </span>
      )}
    </button>
  )
}
