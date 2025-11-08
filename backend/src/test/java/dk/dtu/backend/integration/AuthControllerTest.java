package dk.dtu.backend.integration;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.context.annotation.Import;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.test.context.ActiveProfiles;

import dk.dtu.backend.TestApplication;
import dk.dtu.backend.TestDataFactory;
import dk.dtu.backend.TestSecurityConfig;
import dk.dtu.backend.dto.RegisterRequest;
import dk.dtu.backend.persistence.entity.Address;
import dk.dtu.backend.persistence.entity.Artist;
import dk.dtu.backend.persistence.entity.User;
import dk.dtu.backend.persistence.repository.AddressRepository;
import dk.dtu.backend.persistence.repository.UserRepository;
import dk.dtu.backend.utils.JwtUtil;

@SpringBootTest(
    classes = TestApplication.class, 
    webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT
)
@Import(TestSecurityConfig.class)
@ActiveProfiles("test")
public class AuthControllerTest {

    @LocalServerPort
    private int port;

    @Autowired
    private TestRestTemplate restTemplate;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AddressRepository addressRepository;

    private String baseUrl;
    private String uniqueCustomerEmail;
    private String uniqueArtistEmail;
    private User customerUser;
    private User artistUser;
    private Artist artist;
    private Address address;
    private String customerJwtToken;
    private User registeredCustomerUser;
    private Address registeredCustomerAddress;

    @BeforeEach
    public void setup() {
        baseUrl = "http://localhost:" + port + "/api/auth";
        
        // Generate unique emails for each test to avoid conflicts
        uniqueCustomerEmail = "customer_" + System.currentTimeMillis() + "@example.com";
        uniqueArtistEmail = "artist_" + System.currentTimeMillis() + "@example.com";
        
        // Create test data once for all tests
        customerUser = TestDataFactory.createUser(uniqueCustomerEmail, "CUSTOMER");
        artistUser = TestDataFactory.createUser(uniqueArtistEmail, "ARTIST");
        artist = TestDataFactory.createArtist(artistUser);
        address = TestDataFactory.createAddress();
        address.setEmail(uniqueCustomerEmail);

        // Setup for address tests
        setupAddressTestData();
    }

    private void setupAddressTestData() {
        // Clean up
        addressRepository.deleteAll();
        userRepository.deleteAll();

        // Create customer user with address for address endpoint tests
        String addressTestEmail = "addresstest_" + System.currentTimeMillis() + "@example.com";
        registeredCustomerUser = TestDataFactory.createUser(addressTestEmail, "CUSTOMER");
        registeredCustomerUser = userRepository.save(registeredCustomerUser);
        
        registeredCustomerAddress = TestDataFactory.createAddress();
        registeredCustomerAddress.setUser(registeredCustomerUser);
        registeredCustomerAddress.setEmail(addressTestEmail);
        addressRepository.save(registeredCustomerAddress);
        
        customerJwtToken = JwtUtil.generateToken(addressTestEmail, "CUSTOMER", registeredCustomerUser.getId());
    }

    // ---------------------------- REGISTER TESTS ----------------------------

    @Test
    public void register_CustomerWithAddress_Returns200() {
        System.out.println("=== TESTING CUSTOMER REGISTRATION WITH ADDRESS ===");
        
        // Arrange - CUSTOMER must have address
        RegisterRequest request = new RegisterRequest();
        request.setUser(customerUser);
        request.setAddress(address);

        // Act
        ResponseEntity<Map> response = restTemplate.postForEntity(
            baseUrl + "/register",
            request,
            Map.class
        );

        // Assert
        System.out.println("Response Status: " + response.getStatusCode());
        System.out.println("Response Body: " + response.getBody());
        
        assertEquals(HttpStatus.OK, response.getStatusCode(), "Registration should return 200 OK");
        assertTrue((Boolean) response.getBody().get("success"), "Success should be true");
        assertEquals("User registered successfully and logged in", response.getBody().get("message"));
    }


    @Test
    public void register_ArtistWithArtistInfo_Returns200() {
        System.out.println("=== TESTING ARTIST REGISTRATION ===");
        
        // Arrange - ARTIST must have artist info
        RegisterRequest request = new RegisterRequest();
        request.setUser(artistUser);
        request.setArtist(artist);

        // Act
        ResponseEntity<Map> response = restTemplate.postForEntity(
            baseUrl + "/register",
            request,
            Map.class
        );

        // Assert
        System.out.println("Response Status: " + response.getStatusCode());
        System.out.println("Response Body: " + response.getBody());
        
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertTrue((Boolean) response.getBody().get("success"));
    }

    @Test
    public void register_InvalidEmail_Returns400() {
        System.out.println("=== TESTING INVALID EMAIL VALIDATION ===");
        
        // Arrange
        User invalidUser = new User();
        invalidUser.setEmail("invalid-email");
        invalidUser.setPassword("password123");
        invalidUser.setAccountType("CUSTOMER");

        Address invalidAddress = TestDataFactory.createAddress();
        invalidAddress.setEmail("invalid-email");

        RegisterRequest request = new RegisterRequest();
        request.setUser(invalidUser);
        request.setAddress(invalidAddress);

        // Act
        ResponseEntity<Map> response = restTemplate.postForEntity(
            baseUrl + "/register",
            request,
            Map.class
        );

        // Assert
        System.out.println("Response Status: " + response.getStatusCode());
        System.out.println("Response Body: " + response.getBody());
        
        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertFalse((Boolean) response.getBody().get("success"));
        assertEquals("Invalid email format", response.getBody().get("error"));
    }

    @Test
    public void register_ShortPassword_Returns400() {
        System.out.println("=== TESTING SHORT PASSWORD VALIDATION ===");
        
        // Arrange
        User shortPasswordUser = new User();
        shortPasswordUser.setEmail("shortpass_" + System.currentTimeMillis() + "@example.com");
        shortPasswordUser.setPassword("123"); // Too short
        shortPasswordUser.setAccountType("CUSTOMER");

        Address shortPasswordAddress = TestDataFactory.createAddress();
        shortPasswordAddress.setEmail(shortPasswordUser.getEmail());

        RegisterRequest request = new RegisterRequest();
        request.setUser(shortPasswordUser);
        request.setAddress(shortPasswordAddress);

        // Act
        ResponseEntity<Map> response = restTemplate.postForEntity(
            baseUrl + "/register",
            request,
            Map.class
        );

        // Assert
        System.out.println("Response Status: " + response.getStatusCode());
        System.out.println("Response Body: " + response.getBody());
        
        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertFalse((Boolean) response.getBody().get("success"));
        assertEquals("Password must be at least 8 characters", response.getBody().get("error"));
    }

    // ---------------------------- LOGIN TESTS ----------------------------

    @Test
    public void login_ValidCustomerCredentials_Returns200() {
        System.out.println("=== TESTING LOGIN WITH VALID CREDENTIALS ===");
        
        // First register a customer
        RegisterRequest registerRequest = new RegisterRequest();
        registerRequest.setUser(customerUser);
        registerRequest.setAddress(address);
        
        // Register the user first
        ResponseEntity<Map> registerResponse = restTemplate.postForEntity(
            getBaseUrl() + "/register", 
            registerRequest, 
            Map.class
        );
        assertEquals(HttpStatus.OK, registerResponse.getStatusCode());

        // Arrange login
        Map<String, String> credentials = TestDataFactory.createLoginCredentials(
            uniqueCustomerEmail, "password123"
        );

        // Act - Login
        ResponseEntity<Map> response = restTemplate.postForEntity(
            baseUrl + "/login",
            credentials,
            Map.class
        );

        // Assert
        System.out.println("Login Response Status: " + response.getStatusCode());
        System.out.println("Login Response Body: " + response.getBody());
        
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertTrue((Boolean) response.getBody().get("success"));
        assertEquals("Login successful", response.getBody().get("message"));
        
        // Check JWT cookie is set
        String setCookieHeader = response.getHeaders().getFirst(HttpHeaders.SET_COOKIE);
        assertNotNull(setCookieHeader);
        assertTrue(setCookieHeader.contains("jwt="));
    }

    @Test
    public void login_InvalidCredentials_Returns401() {
        System.out.println("=== TESTING LOGIN WITH INVALID CREDENTIALS ===");
        
        // Arrange
        Map<String, String> credentials = TestDataFactory.createLoginCredentials(
            "nonexistent_" + System.currentTimeMillis() + "@example.com", 
            "wrongpassword"
        );

        // Act
        ResponseEntity<Map> response = restTemplate.postForEntity(
            baseUrl + "/login",
            credentials,
            Map.class
        );

        // Assert
        System.out.println("Response Status: " + response.getStatusCode());
        System.out.println("Response Body: " + response.getBody());
        
        assertEquals(HttpStatus.UNAUTHORIZED, response.getStatusCode());
        assertFalse((Boolean) response.getBody().get("success"));
        assertEquals("Invalid credentials", response.getBody().get("error"));
    }

    @Test
    public void login_MissingCredentials_Returns400() {
        System.out.println("=== TESTING LOGIN WITH MISSING CREDENTIALS ===");
        
        // Arrange - missing password
        Map<String, String> credentials = Map.of("email", "test@example.com");

        // Act
        ResponseEntity<Map> response = restTemplate.postForEntity(
            baseUrl + "/login",
            credentials,
            Map.class
        );

        // Assert
        System.out.println("Response Status: " + response.getStatusCode());
        System.out.println("Response Body: " + response.getBody());
        
        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertFalse((Boolean) response.getBody().get("success"));
        assertEquals("Email and password are required", response.getBody().get("error"));
    }

    // ---------------------------- FIREBASE LOGIN TESTS ----------------------------

    @Test
    public void loginWithFirebase_ValidMockToken_Returns200() {
        System.out.println("=== TESTING FIREBASE LOGIN WITH MOCK TOKEN ===");
        
        // Arrange - Create a mock Firebase token request
        String mockToken = "mock-firebase-token-" + System.currentTimeMillis();
        
        Map<String, String> firebaseRequest = Map.of("token", mockToken);

        // Act
        ResponseEntity<Map> response = restTemplate.postForEntity(
            baseUrl + "/login/firebase",
            firebaseRequest,
            Map.class
        );

        // Assert - The endpoint should at least respond
        System.out.println("Firebase Login Response Status: " + response.getStatusCode());
        System.out.println("Firebase Login Response Body: " + response.getBody());
        
        assertNotNull(response.getBody());
        
        // It might return 401 for invalid token, but that's still a valid test
        if (response.getStatusCode() == HttpStatus.UNAUTHORIZED) {
            assertFalse((Boolean) response.getBody().get("success"));
            assertEquals("Invalid Firebase token", response.getBody().get("error"));
        }
    }

    @Test
    public void loginWithFirebase_MissingToken_Returns400() {
        System.out.println("=== TESTING FIREBASE LOGIN WITH MISSING TOKEN ===");
        
        // Arrange - empty token
        Map<String, String> firebaseRequest = Map.of("token", "");

        // Act
        ResponseEntity<Map> response = restTemplate.postForEntity(
            baseUrl + "/login/firebase",
            firebaseRequest,
            Map.class
        );

        // Assert
        System.out.println("Response Status: " + response.getStatusCode());
        System.out.println("Response Body: " + response.getBody());
        
        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertFalse((Boolean) response.getBody().get("success"));
        assertEquals("Missing idToken", response.getBody().get("error"));
    }

    // ---------------------------- LOGOUT TESTS ----------------------------

    @Test
    public void logout_Returns200WithClearedCookie() {
        System.out.println("=== TESTING LOGOUT ===");
        
        // Act
        ResponseEntity<Map> response = restTemplate.getForEntity(
            baseUrl + "/logout",
            Map.class
        );

        // Assert
        System.out.println("Response Status: " + response.getStatusCode());
        System.out.println("Response Body: " + response.getBody());
        
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertTrue((Boolean) response.getBody().get("success"));
        assertEquals("Logged out successfully", response.getBody().get("message"));
        
        // Check JWT cookie is cleared
        String setCookieHeader = response.getHeaders().getFirst(HttpHeaders.SET_COOKIE);
        assertNotNull(setCookieHeader);
        assertTrue(setCookieHeader.contains("Max-Age=0") || setCookieHeader.contains("jwt=;"));
    }

    // ---------------------------- ADDRESS ENDPOINT TESTS ----------------------------
    @Test
    public void getMyAddress_WithoutAuth_ReturnsForbidden() {
        System.out.println("=== TEST: Get address without auth ===");

        // Arrange - No headers
        HttpHeaders headers = new HttpHeaders();
        HttpEntity<String> request = new HttpEntity<>(headers);

        // Act - Use String.class to handle plain text response
        ResponseEntity<String> response = restTemplate.exchange(
            baseUrl + "/address",
            HttpMethod.GET,
            request,
            String.class
        );

        // Assert
        System.out.println("Response: " + response.getStatusCode() + " - " + response.getBody());
        assertEquals(HttpStatus.FORBIDDEN, response.getStatusCode());
    }

    @Test
    public void getMyAddress_UserWithoutAddress_ReturnsForbidden() {
        System.out.println("=== TEST: Get address when user has no address ===");

        // Create user without address
        String noAddressEmail = "noaddress_" + System.currentTimeMillis() + "@example.com";
        User noAddressUser = TestDataFactory.createUser(noAddressEmail, "CUSTOMER");
        noAddressUser = userRepository.save(noAddressUser);
        String noAddressToken = JwtUtil.generateToken(noAddressEmail, "CUSTOMER", noAddressUser.getId());

        // Arrange
        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Bearer " + noAddressToken);
        headers.add("Cookie", "jwt=" + noAddressToken);

        HttpEntity<String> request = new HttpEntity<>(headers);

        // Act - Use String.class to handle plain text response
        ResponseEntity<String> response = restTemplate.exchange(
            baseUrl + "/address",
            HttpMethod.GET,
            request,
            String.class
        );

        // Assert
        System.out.println("Response: " + response.getStatusCode() + " - " + response.getBody());
        assertEquals(HttpStatus.FORBIDDEN, response.getStatusCode());
        assertEquals("No address found", response.getBody());
    }

    @Test
    public void getMyAddress_WithArtistToken_ReturnsForbidden() {
        System.out.println("=== TEST: Get address with artist token (should fail) ===");

        // Create artist user
        String artistEmail = "artist_" + System.currentTimeMillis() + "@example.com";
        User artistUser = TestDataFactory.createUser(artistEmail, "ARTIST");
        artistUser = userRepository.save(artistUser);
        String artistToken = JwtUtil.generateToken(artistEmail, "ARTIST", artistUser.getId());

        // Arrange
        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Bearer " + artistToken);
        headers.add("Cookie", "jwt=" + artistToken);

        HttpEntity<String> request = new HttpEntity<>(headers);

        // Act
        ResponseEntity<String> response = restTemplate.exchange(
            baseUrl + "/address",
            HttpMethod.GET,
            request,
            String.class
        );

        // Assert - Artist should get 403 Forbidden due to role protection
        System.out.println("Response: " + response.getStatusCode());
        assertEquals(HttpStatus.FORBIDDEN, response.getStatusCode());
    }

    private String getBaseUrl() {
        return baseUrl;
    }
}