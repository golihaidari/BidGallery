package dk.dtu.backend.unit;

import dk.dtu.backend.TestDataFactory;
import dk.dtu.backend.persistence.entity.AccountType;
import dk.dtu.backend.persistence.entity.Artist;
import dk.dtu.backend.persistence.entity.Product;
import dk.dtu.backend.persistence.entity.User;
import dk.dtu.backend.service.ProductService;
import dk.dtu.backend.service.LoggingService;
import dk.dtu.backend.persistence.repository.ProductRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class ProductServiceTest {

    @Mock
    private ProductRepository productRepository;

    @Mock
    private LoggingService loggingService;

    @InjectMocks
    private ProductService productService;

    private User artistUser;
    private Artist artist;
    private Product availableProduct;
    private Product soldProduct;

    @BeforeEach
    public void setup() {
        // Create test data once for all tests
        artistUser = TestDataFactory.createUser("artist@example.com", AccountType.ARTIST);
        artist = TestDataFactory.createArtist(artistUser);
        availableProduct = TestDataFactory.createProductWithId(1, artist, 500.0);
        soldProduct = TestDataFactory.createSoldProduct(artist);
        soldProduct.setId(2);
    }

    // =========================================================================
    // METHODS USED BY CheckoutController ONLY
    // =========================================================================

    @Test
    public void getProductById_ExistingProduct_ReturnsProduct() {
        // Arrange
        when(productRepository.findById(1)).thenReturn(Optional.of(availableProduct));

        // Act
        Optional<Product> result = productService.getProductById(1);

        // Assert
        assertTrue(result.isPresent());
        assertEquals(1, result.get().getId());
    }

    @Test
    public void getProductById_NonExistingProduct_ReturnsEmpty() {
        // Arrange
        when(productRepository.findById(999)).thenReturn(Optional.empty());

        // Act
        Optional<Product> result = productService.getProductById(999);

        // Assert
        assertFalse(result.isPresent());
    }

    @Test
    public void placeBid_ValidBidAboveSecretPrice_ReturnsTrue() {
        // Arrange
        when(productRepository.findById(1)).thenReturn(Optional.of(availableProduct));

        // Act
        boolean result = productService.placeBid(1, 600.0, "test@test.com", "req123");

        // Assert
        assertTrue(result);
    }

    @Test
    public void placeBid_BidTooLow_ReturnsFalse() {
        // Arrange
        when(productRepository.findById(1)).thenReturn(Optional.of(availableProduct));

        // Act
        boolean result = productService.placeBid(1, 300.0, "test@test.com", "req123");

        // Assert
        assertFalse(result);
    }

    @Test
    public void placeBid_ProductNotFound_ReturnsFalse() {
        // Arrange
        when(productRepository.findById(1)).thenReturn(Optional.empty());

        // Act
        boolean result = productService.placeBid(1, 600.0, "test@test.com", "req123");

        // Assert
        assertFalse(result);
    }

    @Test
    public void placeBid_SoldProduct_ReturnsFalse() {
        // Arrange
        when(productRepository.findById(2)).thenReturn(Optional.of(soldProduct));

        // Act
        boolean result = productService.placeBid(2, 600.0, "test@test.com", "req123");

        // Assert
        assertFalse(result);
    }
}