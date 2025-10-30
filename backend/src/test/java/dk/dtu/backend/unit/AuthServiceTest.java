package dk.dtu.backend.unit;

import dk.dtu.backend.TestDataFactory;
import dk.dtu.backend.persistence.entity.AccountType;
import dk.dtu.backend.persistence.entity.User;
import dk.dtu.backend.persistence.repository.UserRepository;
import dk.dtu.backend.service.AuthService;
import dk.dtu.backend.service.LoggingService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import jakarta.servlet.http.HttpServletRequest;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

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
        customerUser = TestDataFactory.createUser("customer@example.com", AccountType.CUSTOMER);
        existingUser = TestDataFactory.createUser("existing@example.com", AccountType.CUSTOMER);
        googleUser = TestDataFactory.createUser("google@example.com", AccountType.GOOGLE);
    }

    // =========================================================================
    // METHODS USED BY CheckoutController ONLY (Safe to test)
    // =========================================================================

    @Test
    public void getTokenFromRequest_ValidCookie_ReturnsToken() {
        // Arrange
        String expectedToken = "test-jwt-token";
        HttpServletRequest request = TestDataFactory.createRequestWithJwtCookie(expectedToken);

        // Act
        String result = authService.getTokenFromRequest(request);

        // Assert
        assertEquals(expectedToken, result);
    }

    @Test
    public void getTokenFromRequest_NoCookie_ReturnsNull() {
        // Arrange
        HttpServletRequest request = TestDataFactory.createRequestWithoutCookies();

        // Act
        String result = authService.getTokenFromRequest(request);

        // Assert
        assertNull(result);
    }

    @Test
    public void getTokenFromRequest_NullCookies_ReturnsNull() {
        // Arrange
        HttpServletRequest request = mock(HttpServletRequest.class);
        when(request.getCookies()).thenReturn(null);

        // Act
        String result = authService.getTokenFromRequest(request);

        // Assert
        assertNull(result);
    }

    // =========================================================================
    // METHODS USED BY AuthController ONLY (Safe to test)
    // =========================================================================

    @Test
    public void register_NewCustomer_ReturnsTrueAndSavesUser() {
        // Arrange
        String requestId = "test-request-123";
        
        when(userRepository.findByEmail(customerUser.getEmail())).thenReturn(Optional.empty());
        when(userRepository.save(any(User.class))).thenReturn(customerUser);

        // Act
        boolean result = authService.register(customerUser, requestId);

        // Assert
        assertTrue(result, "Registration should succeed for new customer");
        verify(userRepository).save(any(User.class));
        // UPDATED: Changed to match new log messages
        verify(loggingService).info(eq("User registration started"), anyMap());
        verify(loggingService).info(eq("User registration completed successfully"), anyMap());
    }

    @Test
    public void register_ExistingEmail_ReturnsFalse() {
        // Arrange
        String requestId = "test-request-456";
        
        when(userRepository.findByEmail(existingUser.getEmail())).thenReturn(Optional.of(existingUser));

        // Act
        boolean result = authService.register(existingUser, requestId);

        // Assert
        assertFalse(result, "Registration should fail for existing email");
        verify(userRepository, never()).save(any());
        // UPDATED: Changed to match new log messages
        verify(loggingService).info(eq("User registration started"), anyMap());
        verify(loggingService).warn(eq("Registration failed - email already exists"), anyMap());
    }

    @Test
    public void register_GoogleAccount_NoPassword_Success() {
        // Arrange
        String requestId = "test-request-555";
        
        googleUser.setEmail("newEmail@test.com");
        when(userRepository.findByEmail(googleUser.getEmail())).thenReturn(Optional.empty());
        when(userRepository.save(any(User.class))).thenReturn(googleUser);

        // Act
        boolean result = authService.register(googleUser, requestId);

        // Assert
        assertTrue(result, "Google account registration should succeed without password");
        verify(userRepository).save(any(User.class));
    }

    @Test
    public void login_UserNotFound_ReturnsEmptyOptional() {
        // Arrange
        String email = "nonexistent@example.com";
        String password = "anyPassword";
        String requestId = "test-request-999";
        
        when(userRepository.findByEmail(email)).thenReturn(Optional.empty());

        // Act
        Optional<String> result = authService.login(email, password, requestId);

        // Assert
        assertFalse(result.isPresent(), "Should return empty for non-existent user");
    }

    @Test
    public void login_ValidCredentials_CallsRepository() {
        // Arrange
        String requestId = "test-request-789";
        
        when(userRepository.findByEmail(customerUser.getEmail())).thenReturn(Optional.of(customerUser));

        // Act
        authService.login(customerUser.getEmail(), customerUser.getPassword(), requestId);

        // Assert - Verify the flow is called
        verify(userRepository).findByEmail(customerUser.getEmail());
    }
}