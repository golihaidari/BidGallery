package dk.dtu.backend.unit;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import static org.mockito.ArgumentMatchers.any;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.context.ActiveProfiles;

import dk.dtu.backend.TestDataFactory;
import dk.dtu.backend.dto.CartItemDTO;
import dk.dtu.backend.persistence.entity.Address;
import dk.dtu.backend.persistence.entity.Artist;
import dk.dtu.backend.persistence.entity.Order;
import dk.dtu.backend.persistence.entity.Product;
import dk.dtu.backend.persistence.entity.User;
import dk.dtu.backend.persistence.repository.OrderRepository;
import dk.dtu.backend.service.AddressService;
import dk.dtu.backend.service.LoggingService;
import dk.dtu.backend.service.OrderService;
import dk.dtu.backend.service.PaymentService;
import dk.dtu.backend.service.ProductService;

@ActiveProfiles("test")
@ExtendWith(MockitoExtension.class)
public class OrderServiceTest {

    @Mock
    private OrderRepository orderRepository;

    @Mock
    private AddressService addressService;

    @Mock
    private ProductService productService;

    @Mock
    private PaymentService paymentService;

    @Mock
    private LoggingService loggingService;

    @InjectMocks
    private OrderService orderService;

    private User customer;
    private Address address;
    private User artistUser;
    private Artist artist;
    private Product availableProduct;
    private List<CartItemDTO> validCart;
    private List<CartItemDTO> invalidCart;

    @BeforeEach
    public void setup() {
        // Create test data once for all tests
        customer = TestDataFactory.createUser("customer@example.com", "CUSTOMER");
        address = TestDataFactory.createAddress();
        
        artistUser = TestDataFactory.createUser("artist@example.com", "ARTIST");
        artist = TestDataFactory.createArtist(artistUser);
        availableProduct = TestDataFactory.createProductWithId(1, artist, 500.0);
        
        validCart = TestDataFactory.createCartWithOneItem(1, 600.0);
        invalidCart = TestDataFactory.createCartWithOneItem(999, 600.0); // Non-existent product
    }

    // =========================================================================
    // METHODS USED BY CheckoutController ONLY
    // =========================================================================

    @Test
    public void placeOrder_ValidOrder_ReturnsOrder() {
        // Arrange
        when(paymentService.validatePayment("valid-payment")).thenReturn(true);
        //when(addressService.findByAddressFields(any(), any(), any())).thenReturn(Optional.empty());
        when(addressService.saveAddress(any())).thenReturn(address);
        when(orderRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));
        when(productService.getProductById(1)).thenReturn(Optional.of(availableProduct));

        // Act
        Order result = orderService.placeOrder(
            customer, 
            validCart, 
            address, 
            "valid-payment", 
            customer.getEmail()
        );

        // Assert
        assertNotNull(result);
    }

    @Test
    public void placeOrder_PaymentValidationFails_ThrowsException() {
        // Arrange
        when(paymentService.validatePayment("invalid-payment")).thenReturn(false);

        // Act & Assert
        assertThrows(IllegalArgumentException.class, () -> {
            orderService.placeOrder(
                customer, 
                validCart, 
                address, 
                "invalid-payment", 
                customer.getEmail()
            );
        });
    }

    @Test
    public void getAllOrders_ReturnsOrderList() {
        // Arrange
        List<Order> expectedOrders = List.of(new Order(), new Order());
        when(orderRepository.findAll()).thenReturn(expectedOrders);

        // Act
        List<Order> result = orderService.getAllOrders();

        // Assert
        assertEquals(2, result.size());
    }

    @Test
    public void getOrderById_ExistingOrder_ReturnsOrder() {
        // Arrange
        Order expectedOrder = new Order();
        expectedOrder.setId(1);
        when(orderRepository.findById(1)).thenReturn(Optional.of(expectedOrder));

        // Act
        Optional<Order> result = orderService.getOrderById(1);

        // Assert
        assertTrue(result.isPresent());
        assertEquals(1, result.get().getId());
    }

    @Test
    public void getOrderById_NonExistingOrder_ReturnsEmpty() {
        // Arrange
        when(orderRepository.findById(999)).thenReturn(Optional.empty());

        // Act
        Optional<Order> result = orderService.getOrderById(999);

        // Assert
        assertFalse(result.isPresent());
    }
}