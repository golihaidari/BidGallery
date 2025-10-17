package dk.dtu.backend.controller;

import java.util.Map;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import dk.dtu.backend.dto.CheckoutRequest;
import dk.dtu.backend.persistence.entity.AccountType;
import dk.dtu.backend.persistence.entity.Order;
import dk.dtu.backend.persistence.entity.Product;
import dk.dtu.backend.security.Protected;
import dk.dtu.backend.security.RoleProtected;
import dk.dtu.backend.service.MetricService;
import dk.dtu.backend.service.OrderService;
import dk.dtu.backend.service.ProductService;
import dk.dtu.backend.service.UserService;

@RestController
@RequestMapping("/api/checkout")
public class CheckoutController {

    @Autowired
    private OrderService orderService;

    @Autowired
    private ProductService productService;

    @Autowired
    private UserService userService;

    @Autowired
    private MetricService metricService;

    // ----------------------------- Place bid -----------------------------
    @PostMapping("/placebid")
    @Protected
    @RoleProtected(roles = {AccountType.CUSTOMER})
    public ResponseEntity<?> placeBid(@RequestBody Map<String, Object> request,
                                      @RequestHeader(value = "X-User-Email", required = false) String email) {

        long startTime = System.currentTimeMillis();
        String requestId = UUID.randomUUID().toString();

        Integer productId;
        double bidAmount;

        try {
            productId = Integer.parseInt(request.get("productId").toString());
            bidAmount = Double.parseDouble(request.get("amount").toString());
        } catch (Exception e) {
            metricService.incrementCounter("product.bid", "success", "false");
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid productId or bid amount"));
        }

        Product product = productService.getProductById(productId).orElse(null);
        if (product == null) {
            metricService.incrementCounter("product.bid", "success", "false");
            return ResponseEntity.status(404).body(Map.of("error", "Product not found with id " + productId));
        }
        
        if(product.isSold()){
            return ResponseEntity.badRequest().body(Map.of(
                "message", "Product already sold."
            ));  
        }

        boolean accepted = productService.placeBid(productId, bidAmount, email, requestId);
        long duration = System.currentTimeMillis() - startTime;

        metricService.recordDuration("product.bid.duration", duration, "success", String.valueOf(accepted));

        if (accepted) {
            metricService.incrementCounter("product.bid", "success", "true");
            return ResponseEntity.ok(Map.of(
                    "message", "Bid for product Id: "+productId+" is accepted."
            ));
        } else {
            metricService.incrementCounter("product.bid", "success", "false");
            return ResponseEntity.badRequest().body(Map.of(
                    "message", "Bid too low. Retry agaian."
            ));
        }
    }

    // ----------------------------- Place order -----------------------------
    @PostMapping("/placeorder")
    public ResponseEntity<?> placeOrder(@RequestBody CheckoutRequest request,
                                        @RequestHeader(value = "X-User-Email", required = false) String email) {

        long startTime = System.currentTimeMillis();
        String requestId = UUID.randomUUID().toString();

        if (request.getCart() == null || request.getCart().isEmpty() || request.getAddress() == null ||
            request.getPaymentIntentId() == null || request.getPaymentIntentId().isBlank()) {

            metricService.incrementCounter("checkout.orders", "success", "false");
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "error", "Invalid cart, missing address, or payment intent"
            ));
        }

        var user = (email != null) ? userService.getUserByEmail(email).orElse(null) : null;

        try {
            Order savedOrder = orderService.placeOrder(
                    user,
                    request.getCart(),
                    request.getAddress(),
                    request.getPaymentIntentId(),
                    email,
                    requestId
            );

            long duration = System.currentTimeMillis() - startTime;
            metricService.incrementCounter("checkout.orders", "success", "true");
            metricService.recordDuration("checkout.duration", duration);

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "OrderId"+savedOrder.getId()+" placed successfully"
            ));

        } catch (IllegalArgumentException e) {
            long duration = System.currentTimeMillis() - startTime;
            metricService.incrementCounter("checkout.orders", "success", "false");
            metricService.recordDuration("checkout.duration", duration);

            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "error", e.getMessage()
            ));

        } catch (Exception e) {
            long duration = System.currentTimeMillis() - startTime;
            metricService.incrementCounter("checkout.orders", "success", "false");
            metricService.recordDuration("checkout.duration", duration);

            return ResponseEntity.internalServerError().body(Map.of(
                    "success", false,
                    "error", "Server error while placing order"
            ));
        }
    }
}
