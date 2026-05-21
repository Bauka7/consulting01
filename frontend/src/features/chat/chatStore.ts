import { create } from 'zustand'
import { Client, type IMessage } from '@stomp/stompjs'
import { createWsClient } from '@/shared/lib/websocket'
import type { MessageDto } from '@/entities/conversation/types'

interface ChatState {
  client: Client | null
  connected: boolean
  messages: Record<string, MessageDto[]>
  unreadCount: number

  connect: (token: string) => void
  disconnect: () => void
  subscribe: (conversationId: string, onMessage: (msg: MessageDto) => void) => () => void
  sendMessage: (conversationId: string, content: string) => void
  addMessages: (conversationId: string, msgs: MessageDto[]) => void
  prependMessages: (conversationId: string, msgs: MessageDto[]) => void
  setUnreadCount: (n: number) => void
}

export const useChatStore = create<ChatState>((set, get) => ({
  client: null,
  connected: false,
  messages: {},
  unreadCount: 0,

  connect: (token: string) => {
    const existing = get().client
    if (existing?.active) return

    const client = createWsClient(token)

    client.onConnect = () => {
      set({ connected: true })
    }

    client.onDisconnect = () => {
      set({ connected: false })
    }

    client.activate()
    set({ client })
  },

  disconnect: () => {
    get().client?.deactivate()
    set({ client: null, connected: false })
  },

  subscribe: (conversationId: string, onMessage: (msg: MessageDto) => void) => {
    const { client } = get()
    if (!client?.active) return () => {}

    const sub = client.subscribe(
      `/topic/conversations/${conversationId}`,
      (frame: IMessage) => {
        const msg: MessageDto = JSON.parse(frame.body)
        set((state) => ({
          messages: {
            ...state.messages,
            [conversationId]: [...(state.messages[conversationId] ?? []), msg],
          },
        }))
        onMessage(msg)
      },
    )

    return () => sub.unsubscribe()
  },

  sendMessage: (conversationId: string, content: string) => {
    const { client } = get()
    if (!client?.active) return
    client.publish({
      destination: `/app/conversations/${conversationId}/send`,
      body: JSON.stringify({ content }),
    })
  },

  addMessages: (conversationId: string, msgs: MessageDto[]) => {
    set((state) => ({
      messages: {
        ...state.messages,
        [conversationId]: [...(state.messages[conversationId] ?? []), ...msgs],
      },
    }))
  },

  prependMessages: (conversationId: string, msgs: MessageDto[]) => {
    set((state) => ({
      messages: {
        ...state.messages,
        [conversationId]: [...msgs, ...(state.messages[conversationId] ?? [])],
      },
    }))
  },

  setUnreadCount: (n: number) => set({ unreadCount: n }),
}))
