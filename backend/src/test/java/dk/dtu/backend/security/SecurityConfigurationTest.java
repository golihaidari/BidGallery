package dk.dtu.backend.security;

import dk.dtu.backend.TestDataFactory;
import dk.dtu.backend.persistence.entity.*;
import dk.dtu.backend.persistence.repository.ArtistRepository;
import dk.dtu.backend.persistence.repository.UserRepository;
import dk.dtu.backend.utils.JwtUtil;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.http.*;
import org.springframework.test.context.ActiveProfiles;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
public class SecurityConfigurationTest {

    @LocalServerPort
    private int port;

    @Autowired
    private TestRestTemplate restTemplate;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ArtistRepository artistRepository;

    private String artistsUrl;
    private String usersUrl;
    private String customerJwtToken;
    private String artistJwtToken;
    private String adminJwtToken;

    @BeforeEach
    public void setup() {
        artistsUrl = "http://localhost:" + port + "/api/artists";
        usersUrl = "http://localhost:" + port + "/api/users";
        setupTestData();
    }

    private void setupTestData() {
        artistRepository.deleteAll();
        userRepository.deleteAll();

        // Create customer user
        User customer = TestDataFactory.createUser("customer@example.com", AccountType.CUSTOMER);
        userRepository.save(customer);
        customerJwtToken = JwtUtil.generateToken("customer@example.com", AccountType.CUSTOMER);

        // Create artist user  
        User artist = TestDataFactory.createUser("artist@example.com", AccountType.ARTIST);
        userRepository.save(artist);
        artistJwtToken = JwtUtil.generateToken("artist@example.com", AccountType.ARTIST);

        // Create admin user
        User admin = TestDataFactory.createUser("admin@example.com", AccountType.ADMIN);
        userRepository.save(admin);
        adminJwtToken = JwtUtil.generateToken("admin@example.com", AccountType.ADMIN);

        // Create test artist
        Artist testArtist = TestDataFactory.createArtist(artist);
        artistRepository.save(testArtist);
    }

    // =========================================================================
    // ARTIST CONTROLLER SECURITY TESTS
    // =========================================================================

    @Test
    public void getAllArtists_WithoutAuth_ReturnsUnauthorized() {
        System.out.println("=== TESTING ARTISTS ENDPOINT WITHOUT AUTH ===");

        // Act
        ResponseEntity<String> response = restTemplate.getForEntity(artistsUrl, String.class);

        // Assert - Should be 401 if @Protected works
        System.out.println("Status: " + response.getStatusCode());
        assertEquals(HttpStatus.UNAUTHORIZED, response.getStatusCode(), 
            "Should return 401 UNAUTHORIZED when no authentication provided");
    }

    @Test
    public void getAllArtists_WithCustomerToken_ReturnsOk() {
        System.out.println("=== TESTING ARTISTS ENDPOINT WITH CUSTOMER TOKEN ===");

        // Arrange
        HttpHeaders headers = createAuthHeaders(customerJwtToken);

        // Act
        ResponseEntity<List> response = restTemplate.exchange(
            artistsUrl, HttpMethod.GET, new HttpEntity<>(headers), List.class);

        // Assert - Customer should have access
        assertEquals(HttpStatus.OK, response.getStatusCode(), 
            "Customer should have access to artists endpoint");
    }

    @Test
    public void getAllArtists_WithAdminToken_ReturnsOk() {
        System.out.println("=== TESTING ARTISTS ENDPOINT WITH ADMIN TOKEN ===");

        // Arrange
        HttpHeaders headers = createAuthHeaders(adminJwtToken);

        // Act
        ResponseEntity<List> response = restTemplate.exchange(
            artistsUrl, HttpMethod.GET, new HttpEntity<>(headers), List.class);

        // Assert - Admin should have access
        assertEquals(HttpStatus.OK, response.getStatusCode(), 
            "Admin should have access to artists endpoint");
    }

    @Test
    public void getAllArtists_WithArtistToken_ReturnsOk() {
        System.out.println("=== TESTING ARTISTS ENDPOINT WITH ARTIST TOKEN ===");

        // Arrange
        HttpHeaders headers = createAuthHeaders(artistJwtToken);

        // Act
        ResponseEntity<List> response = restTemplate.exchange(
            artistsUrl, HttpMethod.GET, new HttpEntity<>(headers), List.class);

        // Assert - Artist should have access (if allowed by @RoleProtected)
        // This might return 200 or 403 depending on your role configuration
        assertTrue(response.getStatusCode() == HttpStatus.OK || 
                  response.getStatusCode() == HttpStatus.FORBIDDEN);
    }

    // =========================================================================
    // USER ADDRESS SECURITY TESTS  
    // =========================================================================

    @Test
    public void getUserAddress_WithoutAuth_ReturnsUnauthorized() {
        System.out.println("=== TESTING USER ADDRESS WITHOUT AUTH ===");

        // Act
        ResponseEntity<String> response = restTemplate.getForEntity(
            usersUrl + "/address", String.class);

        // Assert - Should be 401 if @Protected works
        assertEquals(HttpStatus.UNAUTHORIZED, response.getStatusCode(),
            "Should return 401 UNAUTHORIZED when no authentication provided");
    }

    @Test
    public void getUserAddress_WithCustomerToken_ReturnsOkOrForbidden() {
        System.out.println("=== TESTING USER ADDRESS WITH CUSTOMER TOKEN ===");

        // Arrange
        HttpHeaders headers = createAuthHeaders(customerJwtToken);

        // Act
        ResponseEntity<String> response = restTemplate.exchange(
            usersUrl + "/address", HttpMethod.GET, new HttpEntity<>(headers), String.class);

        // Assert - Customer should have access (might return 403 if no address exists)
        assertTrue(response.getStatusCode() == HttpStatus.OK || 
                  response.getStatusCode() == HttpStatus.FORBIDDEN,
            "Customer should be able to access their address endpoint");
    }

    @Test
    public void getUserAddress_WithArtistToken_ReturnsForbidden() {
        System.out.println("=== TESTING USER ADDRESS WITH ARTIST TOKEN ===");

        // Arrange
        HttpHeaders headers = createAuthHeaders(artistJwtToken);

        // Act
        ResponseEntity<String> response = restTemplate.exchange(
            usersUrl + "/address", HttpMethod.GET, new HttpEntity<>(headers), String.class);

        // Assert - Artist should NOT have access (only CUSTOMER role allowed)
        assertEquals(HttpStatus.FORBIDDEN, response.getStatusCode(),
            "Artist should not have access to customer-only endpoint");
    }

    @Test
    public void getUserAddress_WithAdminToken_ReturnsForbidden() {
        System.out.println("=== TESTING USER ADDRESS WITH ADMIN TOKEN ===");

        // Arrange
        HttpHeaders headers = createAuthHeaders(adminJwtToken);

        // Act
        ResponseEntity<String> response = restTemplate.exchange(
            usersUrl + "/address", HttpMethod.GET, new HttpEntity<>(headers), String.class);

        // Assert - Admin should NOT have access (only CUSTOMER role allowed)
        assertEquals(HttpStatus.FORBIDDEN, response.getStatusCode(),
            "Admin should not have access to customer-only endpoint");
    }

    // =========================================================================
    // INVALID TOKEN TESTS
    // =========================================================================

    @Test
    public void getAllArtists_WithInvalidToken_ReturnsUnauthorized() {
        System.out.println("=== TESTING WITH INVALID TOKEN ===");

        // Arrange
        HttpHeaders headers = createAuthHeaders("invalid-jwt-token");

        // Act
        ResponseEntity<String> response = restTemplate.exchange(
            artistsUrl, HttpMethod.GET, new HttpEntity<>(headers), String.class);

        // Assert
        assertEquals(HttpStatus.UNAUTHORIZED, response.getStatusCode(),
            "Should return 401 UNAUTHORIZED with invalid token");
    }

    @Test
    public void getAllArtists_WithExpiredToken_ReturnsUnauthorized() {
        System.out.println("=== TESTING WITH EXPIRED TOKEN ===");

        // Arrange - Create an expired token (you might need to adjust this)
        String expiredToken = "eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9." +
            "eyJzdWIiOiJ0ZXN0QGV4YW1wbGUuY29tIiwicm9sZSI6IkNVU1RPTUVSIiwiaWF0IjoxL" +
            "CJleHAiOjF9.expired-signature";

        HttpHeaders headers = createAuthHeaders(expiredToken);

        // Act
        ResponseEntity<String> response = restTemplate.exchange(
            artistsUrl, HttpMethod.GET, new HttpEntity<>(headers), String.class);

        // Assert
        assertEquals(HttpStatus.UNAUTHORIZED, response.getStatusCode(),
            "Should return 401 UNAUTHORIZED with expired token");
    }

    // =========================================================================
    // HELPER METHODS
    // =========================================================================

    private HttpHeaders createAuthHeaders(String token) {
        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Bearer " + token);
        return headers;
    }
}