package dk.dtu.backend.integration;

import dk.dtu.backend.TestApplication;
import dk.dtu.backend.TestDataFactory;
import dk.dtu.backend.TestSecurityConfig;
import dk.dtu.backend.persistence.entity.*;
import dk.dtu.backend.persistence.repository.UserRepository;
import dk.dtu.backend.utils.JwtUtil;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.actuate.autoconfigure.security.servlet.ManagementWebSecurityAutoConfiguration;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.context.annotation.Import;
import org.springframework.http.*;
import org.springframework.test.context.ActiveProfiles;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;


@SpringBootTest(
    classes = TestApplication.class, 
    webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT
)
@AutoConfigureMockMvc(addFilters = false)
@Import(TestSecurityConfig.class)
@ActiveProfiles("test")
public class ProductControllerTest {

    @LocalServerPort
    private int port;

    @Autowired
    private TestRestTemplate restTemplate;

    @Autowired
    private UserRepository userRepository;

    private String baseUrl;
    private String customerEmail;
    private String customerJwtToken;

    @BeforeEach
    public void setup() {
        baseUrl = "http://localhost:" + port + "/api/products";
        
        // Just create a user for auth
        customerEmail = "customer_" + System.currentTimeMillis() + "@example.com";
        User customerUser = TestDataFactory.createUser(customerEmail, "CUSTOMER");
        customerUser = userRepository.save(customerUser);
        customerJwtToken = JwtUtil.generateToken(customerEmail, "CUSTOMER", customerUser.getId());
    }

    @Test
    public void getAvailableProducts_ReturnsProducts() {
        System.out.println("=== TEST: Get available products ===");

        // Arrange
        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Bearer " + customerJwtToken);
        headers.add("Cookie", "jwt=" + customerJwtToken);

        HttpEntity<String> request = new HttpEntity<>(headers);

        // Act
        ResponseEntity<List> response = restTemplate.exchange(
            baseUrl + "/available",
            HttpMethod.GET,
            request,
            List.class
        );

        // Assert
        System.out.println("Response: " + response.getStatusCode());
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        
        List products = response.getBody();
        System.out.println("Products count: " + products.size());
        assertTrue(products.size() >= 0); // Just check it returns a list
    }

}