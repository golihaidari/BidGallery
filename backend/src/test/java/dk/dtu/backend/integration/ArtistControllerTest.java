package dk.dtu.backend.integration;

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
public class ArtistControllerTest {

    @LocalServerPort
    private int port;

    @Autowired
    private TestRestTemplate restTemplate;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ArtistRepository artistRepository;

    private String baseUrl;
    private String customerEmail;
    private String customerJwtToken;

    @BeforeEach
    public void setup() {
        baseUrl = "http://localhost:" + port + "/api/artists";
        setupTestData();
    }

    private void setupTestData() {
        // Clean up any existing test data
        artistRepository.deleteAll();
        userRepository.deleteAll();

        // Create and save a test customer user
        customerEmail = "artist_customer_" + System.currentTimeMillis() + "@example.com";
        User customer = TestDataFactory.createUser(customerEmail, AccountType.CUSTOMER);
        User savedCustomer = userRepository.save(customer);
        customerJwtToken = JwtUtil.generateToken(customerEmail, AccountType.CUSTOMER);

        // Create and save multiple artists
        User artist1User = TestDataFactory.createUser("artist1@example.com", AccountType.ARTIST);
        User savedArtist1User = userRepository.save(artist1User);
        Artist artist1 = TestDataFactory.createArtist(savedArtist1User);
        artist1.setFirstName("Anna");
        artist1.setLastName("Larsen");
        artistRepository.save(artist1);

        User artist2User = TestDataFactory.createUser("artist2@example.com", AccountType.ARTIST);
        User savedArtist2User = userRepository.save(artist2User);
        Artist artist2 = TestDataFactory.createArtist(savedArtist2User);
        artist2.setFirstName("Bjorn");
        artist2.setLastName("Hansen");
        artistRepository.save(artist2);
    }

    @Test
    public void getAllArtists_AsCustomer_ReturnsAllArtists() {
        System.out.println("=== TESTING GET ALL ARTISTS AS CUSTOMER ===");

        // Arrange
        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Bearer " + customerJwtToken);

        HttpEntity<String> request = new HttpEntity<>(headers);

        // Act
        ResponseEntity<List> response = restTemplate.exchange(
            baseUrl,
            HttpMethod.GET,
            request,
            List.class
        );

        // Assert
        System.out.println("Artists Response: " + response.getBody());
        assertEquals(HttpStatus.OK, response.getStatusCode());
        
        List artists = response.getBody();
        assertNotNull(artists);
        assertTrue(artists.size() >= 2); // Should have at least 2 artists
    }
}