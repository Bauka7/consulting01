import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { MessageSquare, Loader2 } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { conversationApi } from '@/entities/conversation/api'
import { ChatListItem } from '@/shared/ui/ChatListItem'
import { PageHeader } from '@/shared/ui/PageHeader'
import { useAuthStore } from '@/features/auth/authStore'

export default function FactoryMessages() {
  const navigate = useNavigate()
  const { user } = useAuthStore()

  const { data: conversations, isLoading } = useQuery({
    queryKey: ['conversations'],
    queryFn: conversationApi.list,
    refetchInterval: 15000,
  })

  const factoryConversations = conversations?.filter(
    (c) => c.type === 'CONSULTANT_FACTORY',
  ) ?? []
  const totalUnread = factoryConversations.reduce((s, c) => s + c.unreadCount, 0)

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8 flex justify-center pt-20">
        <Loader2 className="w-8 h-8 animate-spin text-[#E63946]" />
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0, transition: { duration: 0.2 } }}
      className="max-w-5xl mx-auto px-4 py-8"
    >
      <PageHeader
        title="Сообщения"
        subtitle={totalUnread > 0 ? `${totalUnread} непрочитанных` : 'Чаты с консультантами'}
      />

      <div className="card overflow-hidden">
        {factoryConversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <MessageSquare className="w-12 h-12 text-[#E8ECF0] mb-3" />
            <p className="font-semibold text-[#0C1426]">Нет сообщений</p>
            <p className="text-sm text-[#718096] mt-1">
              Сообщения появятся, когда консультант напишет вам
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[#E8ECF0]">
            {factoryConversations.map((conv) => {
              const isInitiator = conv.initiatorId === user?.id
              const otherName = isInitiator ? conv.participantName : conv.initiatorName

              return (
                <ChatListItem
                  key={conv.id}
                  chat={{
                    id: conv.id,
                    name: otherName,
                    lastMessage: conv.lastMessage ?? 'Нет сообщений',
                    lastTime: conv.lastMessageAt ?? conv.createdAt,
                    unreadCount: conv.unreadCount,
                    requestProduct: conv.requestProduct,
                    isOnline: false,
                  }}
                  active={false}
                  onClick={() => navigate(`/factory/messages/${conv.id}`)}
                />
              )
            })}
          </div>
        )}
      </div>
    </motion.div>
  )
}
