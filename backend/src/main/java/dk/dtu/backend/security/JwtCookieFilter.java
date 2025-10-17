package dk.dtu.backend.security;

import dk.dtu.backend.persistence.entity.AccountType;
import dk.dtu.backend.utils.JwtUtil;
import jakarta.annotation.Priority;
import jakarta.ws.rs.Priorities;
import jakarta.ws.rs.container.ContainerRequestContext;
import jakarta.ws.rs.container.ContainerRequestFilter;
import jakarta.ws.rs.ext.Provider;
import jakarta.ws.rs.core.Cookie;
import jakarta.ws.rs.core.Response;

import java.io.IOException;
import java.util.Arrays;

@Provider
@Protected  // Only applies to endpoints annotated with @Protected
@Priority(Priorities.AUTHENTICATION)
public class JwtCookieFilter implements ContainerRequestFilter {

    @Override
    public void filter(ContainerRequestContext requestContext) throws IOException {

        // Get JWT from cookie
        Cookie cookie = requestContext.getCookies().get("jwt");

        if (cookie == null) {
            requestContext.abortWith(Response.status(Response.Status.UNAUTHORIZED)
                    .entity("Authentication required").build());
            return;
        }

        String token = cookie.getValue();

        if (JwtUtil.validateToken(token)) {
            String email = JwtUtil.getEmailFromToken(token);
            AccountType userRole = AccountType.valueOf(JwtUtil.getRoleFromToken(token));

            requestContext.setProperty("email", email);
            requestContext.setProperty("role", userRole);

            // Role check
            boolean allowed = requestContext.getUriInfo().getMatchedResources().stream()
                    .anyMatch(r -> {
                        RoleProtected annotation = r.getClass().getAnnotation(RoleProtected.class);
                        if (annotation != null) {
                            return Arrays.asList(annotation.roles()).contains(userRole);
                        }
                        return true; // No role restriction
                    });

            if (!allowed) {
                requestContext.abortWith(Response.status(Response.Status.FORBIDDEN)
                        .entity("Access denied").build());
            }

        } else {
            requestContext.abortWith(Response.status(Response.Status.UNAUTHORIZED)
                    .entity("Invalid JWT").build());
        }
    }
}
