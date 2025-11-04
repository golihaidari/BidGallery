package dk.dtu.backend.integration;

import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Order;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.context.annotation.Import;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.annotation.DirtiesContext.ClassMode;
import org.springframework.test.context.ActiveProfiles;

import dk.dtu.backend.TestApplication;
import dk.dtu.backend.TestDataFactory;
import dk.dtu.backend.TestSecurityConfig;
import dk.dtu.backend.dto.CartItemDTO;
import dk.dtu.backend.dto.CheckoutRequest;
import dk.dtu.backend.persistence.entity.Address;
import dk.dtu.backend.persistence.entity.Artist;
import dk.dtu.backend.persistence.entity.Product;
import dk.dtu.backend.persistence.entity.User;
import dk.dtu.backend.persistence.repository.ArtistRepository;
import dk.dtu.backend.persistence.repository.ProductRepository;
import dk.dtu.backend.persistence.repository.UserRepository;
import dk.dtu.backend.utils.JwtUtil;
@SpringBootTest(
    classes = TestApplication.class, 
    webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT
)
@ActiveProfiles("test")
@Import(TestSecurityConfig.class)
@DirtiesContext(classMode = ClassMode.AFTER_EACH_TEST_METHOD)
public class CheckoutControllerTest {

    @LocalServerPort
    private int port;

    @Autowired
    private TestRestTemplate restTemplate;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private ArtistRepository artistRepository;

    private String baseUrl;
    private String customerEmail;
    private String customerJwtToken;
    private Integer availableProductId;
    private Address testAddress;
    private List<CartItemDTO> testCart;

    @BeforeEach
    public void setup() {
        baseUrl = "http://localhost:" + port + "/api/checkout";

         // Clean up and setup fresh data for EACH test
        cleanupTestData();
        setupTestData();
        
        // Create reusable test objects
        testAddress = TestDataFactory.createAddress();
        testAddress.setUser(null);
        testAddress.setEmail(customerEmail);
        testCart = TestDataFactory.createCartWithOneItem(availableProductId, 600.0);

        verifyTestData();
    }

    private void verifyTestData() {
        // Verify the product was actually saved and can be retrieved
        Product savedProduct = productRepository.findById(availableProductId).orElse(null);
        if (savedProduct == null) {
            throw new IllegalStateException("Test product not found in database! ID: " + availableProductId);
        }
        System.out.println("Verified product exists: " + savedProduct.getId() + ", Title: " + savedProduct.getTitle());
    }

    private void cleanupTestData() {
        // Clean up in reverse order of creation to avoid foreign key constraints
        productRepository.deleteAll();
        artistRepository.deleteAll();
        userRepository.deleteAll();

        // Small delay to ensure cleanup completes
        try {
            Thread.sleep(100);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
    }

    private void setupTestData() {
        // Clean up any existing test data
        productRepository.deleteAll();
        artistRepository.deleteAll();
        userRepository.deleteAll();

        // Create and save a test user first
        customerEmail = "checkout_customer_" + System.currentTimeMillis() + "@example.com";
        User customer = TestDataFactory.createUser(customerEmail, "CUSTOMER");
        User savedCustomer = userRepository.save(customer);
        customerJwtToken = JwtUtil.generateToken(customerEmail, "CUSTOMER", savedCustomer.getId());

        // Create and save an artist with the user
        Artist testArtist = TestDataFactory.createArtist(savedCustomer);
        Artist savedArtist = artistRepository.save(testArtist);

        // Create and save a product with the saved artist
        Product product = TestDataFactory.createProduct(savedArtist, 500.0);
        product.setImageUrl("http://test.com/image.jpg");
        
        Product savedProduct = productRepository.save(product);
        availableProductId = savedProduct.getId();

        System.out.println("Test data setup complete - Product ID: " + availableProductId);
    }

    // ---------------------------- PLACE BID TESTS ----------------------------
    @Test
    @Order(1)
    public void placeBid_BidTooLow_ReturnsRejected() {
        System.out.println("=== TESTING LOW BID REJECTION ===");

        // Arrange
        Map<String, Object> bidRequest = TestDataFactory.createBidRequest(availableProductId, 300.0);
        HttpHeaders headers = createAuthHeaders();
        HttpEntity<Map<String, Object>> request = new HttpEntity<>(bidRequest, headers);

        // Act
        ResponseEntity<Map> response = restTemplate.postForEntity(
            baseUrl + "/placebid",
            request,
            Map.class
        );

        // Assert
        System.out.println("Low Bid Response: " + response.getBody());
        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertTrue(response.getBody().toString().contains("too low"));
    }

    @Test
    @Order(2)
    public void placeBid_ValidBidAsCustomer_ReturnsAccepted() {
        System.out.println("=== TESTING VALID BID AS CUSTOMER ===");

        // Arrange
        Map<String, Object> bidRequest = TestDataFactory.createBidRequest(availableProductId, 600);
        HttpHeaders headers = createAuthHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<Map<String, Object>> request = new HttpEntity<>(bidRequest, headers);

        // Act
        ResponseEntity<Map> response = restTemplate.postForEntity(
            baseUrl + "/placebid",
            request,
            Map.class
        );

        // Assert
        System.out.println("Bid Response: " + response.getBody());
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertTrue(response.getBody().toString().contains("accepted"));
    }

    @Test
    @Order(3)
    public void placeBid_InvalidProductId_ReturnsNotFound() {
        System.out.println("=== TESTING BID ON INVALID PRODUCT ===");

        // Arrange
        Map<String, Object> bidRequest = TestDataFactory.createBidRequest(99999, 600.0);
        HttpHeaders headers = createAuthHeaders();
        HttpEntity<Map<String, Object>> request = new HttpEntity<>(bidRequest, headers);

        // Act
        ResponseEntity<Map> response = restTemplate.postForEntity(
            baseUrl + "/placebid",
            request,
            Map.class
        );

        // Assert
        System.out.println("Invalid Product Response: " + response.getBody());
        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        assertTrue(response.getBody().toString().contains("not found"));
    }

    // ---------------------------- PLACE ORDER TESTS ----------------------------
/* 
    @Test
    @Order(4)
    @Transactional
    public void placeOrder_ValidOrderWithUser_ReturnsSuccess() {
        System.out.println("=== TESTING VALID ORDER PLACEMENT ===");
         Product product = productRepository.findById(availableProductId).orElse(null);
        System.out.println("🔍 Test Product Check:");
        System.out.println("🔍 Product exists: " + (product != null));
        if (product != null) {
            System.out.println("🔍 Product title: " + product.getTitle());
            System.out.println("🔍 Product sold status: " + product.isSold());
            System.out.println("🔍 Product current bid: " + product.getSecretPrice());
        }

        // Arrange order request
        CheckoutRequest orderRequest = new CheckoutRequest();
        orderRequest.setCart(testCart);
        orderRequest.setAddress(testAddress);
        orderRequest.setPaymentIntentId("pi_valid_payment_intent_123");

        // Create request with JWT cookie
        HttpHeaders headers = createOrderHeaders();
        HttpEntity<CheckoutRequest> request = new HttpEntity<>(orderRequest, headers);

        // Act
        ResponseEntity<Map> response = restTemplate.postForEntity(
            baseUrl + "/placeorder",
            request,
            Map.class
        );

        if (response.getStatusCode() == HttpStatus.INTERNAL_SERVER_ERROR) {
            System.out.println("500 ERROR DETAILS: " + response.getBody());
            // Check the server logs for stack traces
        }

        // Assert
        System.out.println("Order Response: " + response.getBody());
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertTrue((Boolean) response.getBody().get("success"));
        assertTrue(response.getBody().toString().contains("placed successfully"));
    }
*/
    @Test
    @Order(5)
    public void placeOrder_MissingPaymentIntent_ReturnsError() {
        System.out.println("=== TESTING ORDER WITH MISSING PAYMENT ===");

        // Arrange
        CheckoutRequest orderRequest = new CheckoutRequest();
        orderRequest.setCart(testCart);
        orderRequest.setAddress(testAddress);
        // Missing paymentIntentId - should fail

        HttpHeaders headers = createOrderHeaders();
        HttpEntity<CheckoutRequest> request = new HttpEntity<>(orderRequest, headers);

        // Act
        ResponseEntity<Map> response = restTemplate.postForEntity(
            baseUrl + "/placeorder",
            request,
            Map.class
        );

        // Assert
        System.out.println("Missing Payment Response: " + response.getBody());
        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertFalse((Boolean) response.getBody().get("success"));
        assertTrue(response.getBody().toString().contains("Invalid cart"));
    }

    @Test
    @Order(6)
    public void placeOrder_EmptyCart_ReturnsError() {
        System.out.println("=== TESTING ORDER WITH EMPTY CART ===");

        // Arrange
        CheckoutRequest orderRequest = new CheckoutRequest();
        orderRequest.setCart(List.of());  // Empty cart
        orderRequest.setAddress(testAddress);
        orderRequest.setPaymentIntentId("pi_test_123");

        HttpHeaders headers = createOrderHeaders();
        HttpEntity<CheckoutRequest> request = new HttpEntity<>(orderRequest, headers);

        // Act
        ResponseEntity<Map> response = restTemplate.postForEntity(
            baseUrl + "/placeorder",
            request,
            Map.class
        );

        // Assert
        System.out.println("Empty Cart Response: " + response.getBody());
        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertFalse((Boolean) response.getBody().get("success"));
        assertTrue(response.getBody().toString().contains("Invalid cart"));
    }

    // ---------------------------- HELPER METHODS ----------------------------

    private HttpHeaders createAuthHeaders() {
        HttpHeaders headers = new HttpHeaders();
        headers.set("X-User-Email", customerEmail);
        headers.set("Authorization", "Bearer " + customerJwtToken);
        return headers;
    }

    private HttpHeaders createOrderHeaders() {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.add("Cookie", "jwt=" + customerJwtToken);
        return headers;
    }
}