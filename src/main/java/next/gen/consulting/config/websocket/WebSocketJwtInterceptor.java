package next.gen.consulting.config.websocket;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import next.gen.consulting.config.jwt.JwtTokenProvider;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

@Slf4j
@Component
@RequiredArgsConstructor
public class WebSocketJwtInterceptor implements ChannelInterceptor {

    private final JwtTokenProvider jwtTokenProvider;
    private final UserDetailsService userDetailsService;

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor =
                MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);

        if (accessor == null || accessor.getCommand() != StompCommand.CONNECT) {
            return message;
        }

        String token = extractToken(accessor);
        if (!StringUtils.hasText(token)) {
            log.warn("WebSocket CONNECT without JWT token");
            throw new IllegalArgumentException("Missing authentication token");
        }

        if (!jwtTokenProvider.validateToken(token)) {
            log.warn("WebSocket CONNECT with invalid JWT token");
            throw new IllegalArgumentException("Invalid authentication token");
        }

        String username = jwtTokenProvider.getUsernameFromToken(token);
        UserDetails userDetails = userDetailsService.loadUserByUsername(username);
        UsernamePasswordAuthenticationToken auth =
                new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());

        accessor.setUser(auth);
        log.debug("WebSocket authenticated: user={}", username);
        return message;
    }

    /**
     * Token can arrive as:
     *  1. STOMP header "Authorization: Bearer <token>"
     *  2. STOMP native header "token: <token>"  (for SockJS query-param workaround)
     */
    private String extractToken(StompHeaderAccessor accessor) {
        // 1. Authorization header
        String authHeader = accessor.getFirstNativeHeader("Authorization");
        if (StringUtils.hasText(authHeader) && authHeader.startsWith("Bearer ")) {
            return authHeader.substring(7);
        }
        // 2. Bare token header (frontend can send token as a custom STOMP header)
        String rawToken = accessor.getFirstNativeHeader("token");
        if (StringUtils.hasText(rawToken)) {
            return rawToken;
        }
        return null;
    }
}
