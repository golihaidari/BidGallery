package dk.dtu.backend.utils;

import java.io.IOException;
import java.util.UUID;

import org.slf4j.MDC;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

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
        String correlationId = generateCorrelationId(request);

        // Initially set user as GUEST - will be updated after JWT filter runs
        String userEmail = "GUEST";

        // Store in MDC for logging
        MDC.put("userEmail", userEmail);
        MDC.put("correlationId", correlationId);

        // Set as request attribute for other filters
        request.setAttribute("correlationId", correlationId);

        // Add to response header for client
        response.setHeader("X-Correlation-ID", correlationId);

        try {
            filterChain.doFilter(request, response);
            
            // After JWT filter runs, we can update userEmail if authenticated
            // This runs AFTER the request is processed by all filters
        } finally {
            MDC.clear(); // Clear MDC after request to avoid leakage
        }
    }

    private String generateCorrelationId(HttpServletRequest request) {
        // Try to get correlationId from header first (if client sent it)
        String incomingCorrelationId = request.getHeader("X-Correlation-ID");
        if (incomingCorrelationId != null && !incomingCorrelationId.trim().isEmpty()) {
            return incomingCorrelationId;
        }
        
        // Generate new correlation ID
        return "corr-" + UUID.randomUUID().toString().substring(0, 8);
    }
}