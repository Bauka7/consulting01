import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client'

export function createWsClient(token: string): Client {
  return new Client({
    webSocketFactory: () => new SockJS('/ws') as WebSocket,
    connectHeaders: { token },
    reconnectDelay: 5000,
    heartbeatIncoming: 4000,
    heartbeatOutgoing: 4000,
  })
}
