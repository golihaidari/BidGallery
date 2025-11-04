package dk.dtu.backend.unit;

import dk.dtu.backend.TestDataFactory;
import dk.dtu.backend.persistence.entity.User;
import dk.dtu.backend.persistence.repository.UserRepository;
import dk.dtu.backend.service.AuthService;
import dk.dtu.backend.service.LoggingService;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.security.core.Authentication;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ActiveProfiles("test")
@ExtendWith(MockitoExtension.class)
public class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private LoggingService loggingService;

    @InjectMocks
    private AuthService authService;

    private User customerUser;
    private User existingUser;
    private User googleUser;

    @BeforeEach
    public void setup() {
        // Create test data once for all tests
        customerUser = TestDataFactory.createUser("customer@example.com", "CUSTOMER");
        existingUser = TestDataFactory.createUser("existing@example.com", "CUSTOMER");
        googleUser = TestDataFactory.createUser("google@example.com", "GOOGLE");
    }

    @AfterEach
    public void tearDown() {
        SecurityContextHolder.clearContext(); // Clean up after each test
    }

    // =========================================================================
    // METHODS USED BY CheckoutController ONLY (Safe to test)
    // =========================================================================

    @Test
    public void getAuthenticatedUser_AuthenticatedUser_ReturnsUser() {
        // Arrange
        String email = "test@dtu.dk";
        User expectedUser = new User();
        expectedUser.setEmail(email);
        expectedUser.setAccountType("CUSTOMER");
        
        // Mock Spring Security context
        Authentication auth = new UsernamePasswordAuthenticationToken(
            email, null, List.of(new SimpleGrantedAuthority("ROLE_CUSTOMER"))
        );
        SecurityContextHolder.getContext().setAuthentication(auth);
        

        // Act
        User result = authService.getAuthenticatedUser();

        // Assert
        assertNotNull(result);
        assertEquals(expectedUser.getEmail(), result.getEmail());
        assertEquals(expectedUser.getAccountType(), result.getAccountType());
    }

    @Test
    public void getAuthenticatedUser_GuestUser_ReturnsNull() {
        // Arrange
        SecurityContextHolder.clearContext(); // No authentication

        // Act
        User result = authService.getAuthenticatedUser();

        // Assert
        assertNull(result);
    }

    // =========================================================================
    // METHODS USED BY AuthController ONLY (Safe to test)
    // =========================================================================

    @Test
    public void register_NewCustomer_ReturnsTrueAndSavesUser() {        
        when(userRepository.findByEmail(customerUser.getEmail())).thenReturn(Optional.empty());
        when(userRepository.save(any(User.class))).thenReturn(customerUser);

        // Act
        boolean result = authService.register(customerUser);

        // Assert
        assertTrue(result, "Registration should succeed for new customer");
        verify(userRepository).save(any(User.class));
        // UPDATED: Changed to match new log messages
        verify(loggingService).info(eq("User registration started"), anyMap());
        verify(loggingService).info(eq("User registration completed successfully"), anyMap());
    }

    @Test
    public void register_ExistingEmail_ReturnsFalse() {        
        when(userRepository.findByEmail(existingUser.getEmail())).thenReturn(Optional.of(existingUser));

        // Act
        boolean result = authService.register(existingUser);

        // Assert
        assertFalse(result, "Registration should fail for existing email");
        verify(userRepository, never()).save(any());
        // UPDATED: Changed to match new log messages
        verify(loggingService).info(eq("User registration started"), anyMap());
        verify(loggingService).warn(eq("Registration failed - email already exists"), anyMap());
    }

    @Test
    public void register_GoogleAccount_NoPassword_Success() {
        
        googleUser.setEmail("newEmail@test.com");
        when(userRepository.findByEmail(googleUser.getEmail())).thenReturn(Optional.empty());
        when(userRepository.save(any(User.class))).thenReturn(googleUser);

        // Act
        boolean result = authService.register(googleUser);

        // Assert
        assertTrue(result, "Google account registration should succeed without password");
        verify(userRepository).save(any(User.class));
    }

    @Test
    public void login_UserNotFound_ReturnsEmptyOptional() {
        // Arrange
        String email = "nonexistent@example.com";
        String password = "anyPassword";
        
        when(userRepository.findByEmail(email)).thenReturn(Optional.empty());

        // Act
        Optional<String> result = authService.login(email, password);

        // Assert
        assertFalse(result.isPresent(), "Should return empty for non-existent user");
    }

    @Test
    public void login_ValidCredentials_CallsRepository() {
        when(userRepository.findByEmail(customerUser.getEmail())).thenReturn(Optional.of(customerUser));

        // Act
        authService.login(customerUser.getEmail(), customerUser.getPassword());

        // Assert - Verify the flow is called
        verify(userRepository).findByEmail(customerUser.getEmail());
    }
}