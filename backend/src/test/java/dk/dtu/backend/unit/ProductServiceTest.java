package dk.dtu.backend.unit;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.context.ActiveProfiles;

import dk.dtu.backend.TestDataFactory;
import dk.dtu.backend.persistence.entity.Artist;
import dk.dtu.backend.persistence.entity.Product;
import dk.dtu.backend.persistence.entity.User;
import dk.dtu.backend.persistence.repository.ProductRepository;
import dk.dtu.backend.service.LoggingService;
import dk.dtu.backend.service.ProductService;

@ActiveProfiles("test")
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
        artistUser = TestDataFactory.createUser("artist@example.com", "ARTIST");
        artist = TestDataFactory.createArtist(artistUser);
        availableProduct = TestDataFactory.createProductWithId(1, artist, 500.0);
        soldProduct = TestDataFactory.createSoldProduct(artist);
        soldProduct.setId(2);
    }

    // METHODS USED BY CheckoutController ONLY //

    @Test
    public void getProductById_ExistingProduct_ReturnsProduct() {
        when(productRepository.findById(1)).thenReturn(Optional.of(availableProduct));

        Optional<Product> result = productService.getProductById(1);

        assertTrue(result.isPresent());
        assertEquals(1, result.get().getId());
    }

    @Test
    public void getProductById_NonExistingProduct_ReturnsEmpty() {
        when(productRepository.findById(999)).thenReturn(Optional.empty());

        Optional<Product> result = productService.getProductById(999);

        assertFalse(result.isPresent());
    }

    @Test
    public void placeBid_ValidBidAboveSecretPrice_ReturnsTrue() {
        when(productRepository.findById(1)).thenReturn(Optional.of(availableProduct));
       
        boolean result = productService.placeBid(1, 600.0);

        assertTrue(result);
    }

    @Test
    public void placeBid_BidTooLow_ReturnsFalse() {
        when(productRepository.findById(1)).thenReturn(Optional.of(availableProduct));

        boolean result = productService.placeBid(1, 300.0);

        assertFalse(result);
    }

    @Test
    public void placeBid_ProductNotFound_ReturnsFalse() {
        when(productRepository.findById(1)).thenReturn(Optional.empty());

        boolean result = productService.placeBid(1, 600.0);

        assertFalse(result);
    }

    @Test
    public void placeBid_SoldProduct_ReturnsFalse() {
        when(productRepository.findById(2)).thenReturn(Optional.of(soldProduct));

        boolean result = productService.placeBid(2, 600.0);

        assertFalse(result);
    }
}
