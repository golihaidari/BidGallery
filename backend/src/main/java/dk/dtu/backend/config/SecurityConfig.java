package dk.dtu.backend.config;

import java.util.Arrays;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import dk.dtu.backend.security.JwtAuthenticationFilter;
import dk.dtu.backend.utils.LoggingFilter;

@Profile("!test")
@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final LoggingFilter loggingFilter;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter, 
                         LoggingFilter loggingFilter) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
        this.loggingFilter = loggingFilter;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(csrf -> csrf.disable())
            .sessionManagement(session -> 
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(authz -> authz
                // Auth public endpoints: 
                .requestMatchers(
                    "/api/auth/register",
                    "/api/auth/login",
                    "/api/auth/login/firebase",
                    "/api/auth/check",
                    "/api/auth/logout"
                ).permitAll()
                // Checkout public endpoints
                .requestMatchers(
                    "/api/products/available",
                    "/api/checkout/placebid",
                    "/api/checkout/placeorder"
                ).permitAll() 
                .requestMatchers("/api/artists/**").permitAll()
                .requestMatchers("/api/auth/address").hasRole("CUSTOMER")
                //Swagger/OpenAPI
                .requestMatchers(
                    "/swagger-ui/**",
                    "/v3/api-docs/**"
                ).permitAll()
                // Actuator / Prometheus
                .requestMatchers(
                    "/actuator/**",
                    "/actuator/prometheus"
                ).permitAll()
                // All other endpoints require authentication
                .anyRequest().authenticated()
            )
            // IMPORTANT: LoggingFilter FIRST, then JWT filter
            .addFilterBefore(loggingFilter, UsernamePasswordAuthenticationFilter.class)
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)
            // Disable default login & basic authentication
            .formLogin(form -> form.disable())
            .httpBasic(basic -> basic.disable());

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(
            Arrays.asList(
            "http://localhost:5173", // Local development
            "https://backend.bidgallery.publicvm.com",  // backend domain (for Swagger)
            "https://frontend.bidgallery.publicvm.com", // frontend domain in CapRover
            
            // Monitoring domains:
            "https://grafana.bidgallery.publicvm.com",   // Grafana dashboard
            "https://prometheus.bidgallery.publicvm.com", // Prometheus metrics
            "https://loki.bidgallery.publicvm.com",      // Loki logs
            "https://promtail.bidgallery.publicvm.com"   // Promtail log collector
            )
        );
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS", "HEAD"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}