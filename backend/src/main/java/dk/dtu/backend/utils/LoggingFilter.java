package dk.dtu.backend.utils;

import java.io.IOException;
import java.util.Optional;
import java.util.UUID;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.slf4j.MDC;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import dk.dtu.backend.persistence.entity.User;
import dk.dtu.backend.service.AuthService;
/**
 * Adds correlationId and userEmail to MDC for structured logging.
 */
@Component
public class LoggingFilter extends OncePerRequestFilter {

    @Autowired
    AuthService authService;
    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        // Generate unique correlation ID per request
        String correlationId = UUID.randomUUID().toString();

        // Extract user email from request header (if present)
        String token = authService.getTokenFromRequest(request);
        String userEmail="";
        if(token != null){
            Optional<User> user = authService.getUserFromToken(token);
            if (user.isPresent()){
                userEmail= user.get().getEmail();
            }
        }

        // Put in MDC for structured logging
        MDC.put("correlationId", correlationId);
        MDC.put("userEmail", !userEmail.isEmpty() ? userEmail : "guest");

        try {
            filterChain.doFilter(request, response);
        } finally {
            MDC.clear(); // Clear MDC after request to avoid leakage
        }
    }
}
