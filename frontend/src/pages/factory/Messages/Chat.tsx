import { useState, useRef, useEffect, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Send, ExternalLink, Loader2 } from 'lucide-react'
import { MessageBubble } from '@/shared/ui/MessageBubble'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { conversationApi } from '@/entities/conversation/api'
import { useChatStore } from '@/features/chat/chatStore'
import { useAuthStore } from '@/features/auth/authStore'
import type { MessageDto } from '@/entities/conversation/types'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import toast from 'react-hot-toast'

export default function FactoryChat() {
  const { id } = useParams<{ id: string }>()
  const { user, accessToken } = useAuthStore()
  const { connected, connect, subscribe, sendMessage, messages, prependMessages } = useChatStore()
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const qc = useQueryClient()

  const { data: conversation } = useQuery({
    queryKey: ['conversation', id],
    queryFn: () => conversationApi.getById(id!),
    enabled: !!id,
  })

  const { data: pageData, isLoading: loadingMsgs } = useQuery({
    queryKey: ['messages', id],
    queryFn: () => conversationApi.getMessages(id!, 0, 50),
    enabled: !!id,
    select: (d) => d.content,
  })

  useEffect(() => {
    if (pageData) prependMessages(id!, [...pageData].reverse())
  }, [pageData, id])

  useEffect(() => {
    if (accessToken) connect(accessToken)
  }, [accessToken])

  useEffect(() => {
    if (!id || !connected) return
    conversationApi.markRead(id)
    qc.invalidateQueries({ queryKey: ['conversations'] })

    const unsub = subscribe(id, () => {
      conversationApi.markRead(id)
    })
    return unsub
  }, [id, connected])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages[id ?? '']])

  const localMessages: MessageDto[] = messages[id ?? ''] ?? []

  const handleSend = useCallback(async () => {
    const text = input.trim()
    if (!text || !id) return
    setSending(true)
    setInput('')
    try {
      if (connected) {
        sendMessage(id, text)
      } else {
        const msg = await conversationApi.sendMessage(id, { content: text })
        useChatStore.getState().addMessages(id, [msg])
      }
    } catch {
      toast.error('Ошибка отправки')
    } finally {
      setSending(false)
    }
  }, [input, id, connected])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const otherName = conversation
    ? conversation.initiatorId === user?.id
      ? conversation.participantName
      : conversation.initiatorName
    : '...'

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col h-[calc(100vh-4rem)]"
    >
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3.5 border-b border-[#E8ECF0] bg-white flex-shrink-0">
        <Link
          to="/factory/messages"
          className="text-[#718096] hover:text-[#0C1426] transition-colors mr-1"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="w-9 h-9 rounded-full bg-[#0C1426] flex items-center justify-center text-white text-sm font-semibold">
          {otherName.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm text-[#0C1426]">{otherName}</p>
          <p className={`text-xs ${connected ? 'text-teal-600' : 'text-[#718096]'}`}>
            {connected ? 'Онлайн' : 'Офлайн'}
          </p>
        </div>
        {conversation && (
          <Link
            to={`/factory/requests/${conversation.requestId}`}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FEE2E2] text-[#E63946] text-xs font-medium hover:bg-[#E63946] hover:text-white transition-colors"
          >
            <ExternalLink className="w-3 h-3" />
            {conversation.requestProduct}
          </Link>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 bg-[#F5F7FA]">
        {loadingMsgs ? (
          <div className="flex justify-center pt-10">
            <Loader2 className="w-6 h-6 animate-spin text-[#E63946]" />
          </div>
        ) : (
          <>
            <div className="flex justify-center mb-4">
              <span className="text-xs text-[#718096] bg-[#E8ECF0] px-3 py-1 rounded-full">
                {format(new Date(), 'dd MMMM yyyy', { locale: ru })}
              </span>
            </div>
            {localMessages.map((msg) => (
              <MessageBubble
                key={msg.id}
                message={msg.content}
                isOwn={msg.senderId === user?.id}
                time={format(new Date(msg.createdAt), 'HH:mm')}
                isRead={msg.read}
              />
            ))}
          </>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="flex items-end gap-2 px-4 py-3 bg-white border-t border-[#E8ECF0] flex-shrink-0">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Написать сообщение..."
          rows={1}
          className="flex-1 resize-none input-field py-2 min-h-[40px] max-h-32"
          onInput={(e) => {
            const t = e.currentTarget
            t.style.height = 'auto'
            t.style.height = t.scrollHeight + 'px'
          }}
        />
        <button
          onClick={handleSend}
          disabled={!input.trim() || sending}
          className="w-9 h-9 flex-shrink-0 bg-[#E63946] text-white rounded-full flex items-center justify-center hover:bg-[#C1121F] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        </button>
      </div>
    </motion.div>
  )
}
