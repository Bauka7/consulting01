package next.gen.consulting.config.websocket;

import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionConnectedEvent;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

import java.security.Principal;

@Slf4j
@Component
public class WebSocketEventListener {

    @EventListener
    public void handleConnect(SessionConnectedEvent event) {
        StompHeaderAccessor accessor = StompHeaderAccessor.wrap(event.getMessage());
        String user = getPrincipalName(accessor.getUser());
        log.info("WebSocket connected: sessionId={} user={}", accessor.getSessionId(), user);
    }

    @EventListener
    public void handleDisconnect(SessionDisconnectEvent event) {
        StompHeaderAccessor accessor = StompHeaderAccessor.wrap(event.getMessage());
        String user = getPrincipalName(accessor.getUser());
        log.info("WebSocket disconnected: sessionId={} user={}", event.getSessionId(), user);
    }

    private String getPrincipalName(Principal principal) {
        if (principal instanceof Authentication auth) {
            return auth.getName();
        }
        return principal != null ? principal.getName() : "anonymous";
    }
}
