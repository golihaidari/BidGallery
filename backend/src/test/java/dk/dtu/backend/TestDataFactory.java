package dk.dtu.backend;

import dk.dtu.backend.dto.CartItemDTO;
import dk.dtu.backend.persistence.entity.*;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

public class TestDataFactory {

    // =========================================================================
    // USERS (Essential for AuthService and OrderService)
    // =========================================================================

    public static User createUser(String email, String accountType) {
        return new User(email, "password123", accountType);
    }

    // =========================================================================
    // ARTISTS (Essential for ProductService)
    // =========================================================================

    public static Artist createArtist(User user) {
        Artist artist = new Artist();
        artist.setFirstName("Test");
        artist.setLastName("Artist");
        artist.setBio("Professional test artist");
        artist.setStyle("Contemporary");
        artist.setUser(user);
        return artist;
    }

    // =========================================================================
    // PRODUCTS (Essential for ProductService and OrderService)
    // =========================================================================

    public static Product createProduct(Artist artist, double secretPrice) {
        Product product = new Product();
        product.setTitle("Test Painting");
        product.setSecretPrice(secretPrice);
        product.setCurrency("DKK");
        product.setSold(false);
        product.setArtist(artist);
        return product;
    }

    public static Product createProductWithId(Integer id, Artist artist, double secretPrice) {
        Product product = createProduct(artist, secretPrice);
        product.setId(id); // For testing specific product IDs
        return product;
    }

    public static Product createSoldProduct(Artist artist) {
        Product product = createProduct(artist, 1000.0);
        product.setSold(true);
        return product;
    }

    // =========================================================================
    // ADDRESSES (Essential for OrderService)
    // =========================================================================

    public static Address createAddress() {
        Address address = new Address();
        address.setFirstName("Goli");
        address.setLastName("Haidari");
        address.setEmail("goli@example.com");
        address.setCountry("Denmark");
        address.setPostalCode("1000");
        address.setCity("Copenhagen");
        address.setAddress1("Test Street 123");
        return address;
    }

    // =========================================================================
    // CART ITEMS (Essential for OrderService)
    // =========================================================================

    public static CartItemDTO createCartItem(Integer productId, double bidPrice) {
        CartItemDTO item = new CartItemDTO();
        item.setProductId(productId);
        item.setBidPrice(bidPrice);
        return item;
    }

    public static List<CartItemDTO> createCartWithOneItem(Integer productId, double bidPrice) {
        return List.of(createCartItem(productId, bidPrice));
    }

    // =========================================================================
    // HTTP REQUESTS & COOKIES (Essential for AuthService)
    // =========================================================================

    public static HttpServletRequest createRequestWithJwtCookie(String token) {
        HttpServletRequest request = mock(HttpServletRequest.class);
        Cookie jwtCookie = new Cookie("jwt", token);
        when(request.getCookies()).thenReturn(new Cookie[]{jwtCookie});
        return request;
    }

    public static HttpServletRequest createRequestWithoutCookies() {
        HttpServletRequest request = mock(HttpServletRequest.class);
        when(request.getCookies()).thenReturn(new Cookie[]{});
        return request;
    }

    // =========================================================================
    // TEST DATA MAPS (Essential for Controller tests)
    // =========================================================================

    public static Map<String, Object> createBidRequest(Integer productId, double amount) {
        return Map.of(
            "productId", productId,
            "amount", amount
        );
    }

    public static Map<String, String> createLoginCredentials(String email, String password) {
        return Map.of(
            "email", email,
            "password", password
        );
    }
}