package dk.dtu.backend.security;

import java.io.IOException;
import java.util.List;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.MDC;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import dk.dtu.backend.utils.JwtUtil;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private static final Logger logger = LoggerFactory.getLogger(JwtAuthenticationFilter.class);

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                  HttpServletResponse response,
                                  FilterChain filterChain) throws ServletException, IOException {
        
        String path = request.getServletPath();

        // Extract JWT from cookie
        String token = extractTokenFromCookie(request);
        
        if (token != null && JwtUtil.validateToken(token)) {
            try {
                String email = JwtUtil.getEmailFromToken(token);
                String userRole = JwtUtil.getRoleFromToken(token);
                int userId = JwtUtil.getUserIdFromToken(token);
                
                // Create Spring Security authentication
                UsernamePasswordAuthenticationToken authentication = 
                    new UsernamePasswordAuthenticationToken(
                        email, 
                        null, 
                        List.of(new SimpleGrantedAuthority("ROLE_" + userRole))
                    );

                // Store userId in authentication details
                authentication.setDetails(Map.of("userId", userId, "email", email));

                SecurityContextHolder.getContext().setAuthentication(authentication);
                
                // Update MDC with authenticated user email
                MDC.put("userEmail", email);
                
                logger.info("JWT authentication successful",
                     Map.of(
                        "email", email,
                        "role", userRole,
                        "userId", String.valueOf(userId),
                        "path", path
                    )
                );
                
            } catch (Exception e) {
                logger.error("Error processing JWT token", Map.of(
                        "path", path,
                        "error", e.getMessage()
                    ));
                // Token is invalid - clear security context
                SecurityContextHolder.clearContext();
            }
        } else {
            if(token == null) {
                logger.debug("No JWT token found in cookies", Map.of(
                "path", path
                ));                
            }
            else{
                logger.warn("Invalid JWT token", Map.of(
                    "path", path
                ));
            } 
        }
        
        filterChain.doFilter(request, response);
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getServletPath();
        boolean shouldNotFilter =  path.startsWith("/swagger-ui/")
            || path.startsWith("/v3/api-docs/")
            || path.startsWith("/actuator/");

        logger.debug("JWT filter exclusion check", Map.of(
            "path", path,
            "excluded", shouldNotFilter
        ));

        return shouldNotFilter;
    }
    
    private String extractTokenFromCookie(HttpServletRequest request) {
        Cookie[] cookies = request.getCookies();
        if (cookies != null) {
            for (Cookie cookie : cookies) {
                if ("jwt".equals(cookie.getName())) {
                    logger.debug("JWT token extracted from cookie", Map.of(
                        "cookieName", cookie.getName(),
                        "tokenLength", String.valueOf(cookie.getValue().length())
                    ));
                    return cookie.getValue();
                }
            }
        }
        return null;
    }
}