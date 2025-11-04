package dk.dtu.backend;

import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;

import dk.dtu.backend.persistence.entity.User;
import dk.dtu.backend.security.JwtAuthenticationFilter;
import dk.dtu.backend.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;

@Configuration
@TestConfiguration
@EnableMethodSecurity(prePostEnabled = false)
public class TestSecurityConfig {

    @Bean
    @Primary
    public AuthService authService() {
        return new AuthService() {
            @Override
            public User getAuthenticatedUser() {
                // Return a dummy customer user for tests
                User user = new User();
                user.setId(1);
                user.setEmail("test@example.com");
                user.setAccountType("CUSTOMER");
                return user;
            }

            // You can also mock other AuthService methods if needed
        };
    }

    /*
    @Bean
    public JwtAuthenticationFilter jwtAuthenticationFilter() {
        return new JwtAuthenticationFilter() {
            @Override
            public boolean shouldNotFilter(HttpServletRequest request) {
                return true; // disable filtering for tests
            }
        };
    }*/
}
