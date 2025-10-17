package dk.dtu.backend.utils;

import java.io.IOException;
import java.util.UUID;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.slf4j.MDC;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

/**
 * Adds correlationId and userEmail to MDC for structured logging.
 */
@Component
public class LoggingFilter extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        // Generate unique correlation ID per request
        String correlationId = UUID.randomUUID().toString();

        // Extract user email from request header (if present)
        String userEmail = request.getHeader("X-User-Email");

        // Put in MDC for structured logging
        MDC.put("correlationId", correlationId);
        MDC.put("userEmail", userEmail != null ? userEmail : "guest");

        try {
            filterChain.doFilter(request, response);
        } finally {
            MDC.clear(); // Clear MDC after request to avoid leakage
        }
    }
}
