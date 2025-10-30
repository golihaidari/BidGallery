package dk.dtu.backend.controller;

import java.util.Map;
import java.util.Optional;
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
import dk.dtu.backend.persistence.entity.User;
import dk.dtu.backend.security.Protected;
import dk.dtu.backend.security.RoleProtected;
import dk.dtu.backend.service.AuthService;
import dk.dtu.backend.service.MetricService;
import dk.dtu.backend.service.OrderService;
import dk.dtu.backend.service.ProductService;
import jakarta.servlet.http.HttpServletRequest;

@RestController
@RequestMapping("/api/checkout")
public class CheckoutController {

    @Autowired
    private OrderService orderService;

    @Autowired
    private ProductService productService;

    @Autowired
    private AuthService authService;

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
            metricService.incrementCounter("checkout.bid", "success", "false", "reason", "invalid_input");
            metricService.recordDuration("checkout.bid.duration", System.currentTimeMillis() - startTime, "success", "false");
            
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid productId or bid amount"));
        }

        Product product = productService.getProductById(productId).orElse(null);
        if (product == null) {
            metricService.incrementCounter("checkout.bid", "success", "false", "reason", "product_not_found");
            metricService.recordDuration("checkout.bid.duration", System.currentTimeMillis() - startTime, "success", "false");

            return ResponseEntity.status(404).body(Map.of("error", "Product not found with id " + productId));
        }
        
        if(product.isSold()){
            metricService.incrementCounter("checkout.bid", "success", "false", "reason", "product_sold");
            metricService.recordDuration("checkout.bid.duration", System.currentTimeMillis() - startTime, "success", "false");

            return ResponseEntity.badRequest().body(Map.of(
                "message", "Product already sold."
            ));  
        }

        boolean accepted = productService.placeBid(productId, bidAmount, email, requestId);

        long duration = System.currentTimeMillis() - startTime;
        if (accepted) {
            // Debug the metric service call
            System.out.println("Calling metricService.incrementCounter... for success................");
            metricService.incrementCounter("checkout.bid", "success", "true");
            metricService.recordDuration("checkout.bid.duration", duration, "success", "true");

            return ResponseEntity.ok(Map.of(
                    "message", "Bid for product Id: "+productId+" is accepted."
            ));
        } else {
            // Debug the metric service call
            System.out.println("Calling metricService.incrementCounter... for false.............");
            metricService.incrementCounter("checkout.bid", "success", "false", "reason", "bid_too_low");
            metricService.recordDuration("checkout.bid.duration", duration, "success", "false");
            
            return ResponseEntity.badRequest().body(Map.of(
                    "message", "Bid too low. Retry agaian."
            ));
        }
    }

    // ----------------------------- Place order -----------------------------
    @PostMapping("/placeorder")
    public ResponseEntity<?> placeOrder(@RequestBody CheckoutRequest request,
                                            HttpServletRequest httpRequest) {

        long startTime = System.currentTimeMillis();
        String requestId = UUID.randomUUID().toString();

        // Extract token from cookies
        String token = authService.getTokenFromRequest(httpRequest);

        User user = null;
        if (token != null) {
            Optional<User> userOpt = authService.getUserFromToken(token);
            if (!userOpt.isEmpty()) {
                user = userOpt.get();
            }
        }

        if (request.getCart() == null || request.getCart().isEmpty() || request.getAddress() == null ||
            request.getPaymentIntentId() == null || request.getPaymentIntentId().isBlank()) {

            metricService.incrementCounter("checkout.order", "success", "false", "reason", "empty_cart | address | payment intent");
            metricService.recordDuration("checkout.order.duration", System.currentTimeMillis() - startTime, "success", "false");
            
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "error", "Invalid cart, missing address, or payment intent"
            ));
        }

        try {
            Order savedOrder = orderService.placeOrder(
                    user,
                    request.getCart(),
                    request.getAddress(),
                    request.getPaymentIntentId(),
                    request.getAddress().getEmail(),
                    requestId
            );

            long duration = System.currentTimeMillis() - startTime;
            metricService.incrementCounter("checkout.order", "success", "true");
            metricService.recordDuration("checkout.order.duration", duration, "success", "true");

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "OrderId "+savedOrder.getId()+" placed successfully."
            ));

        } catch (IllegalArgumentException e) {
            long duration = System.currentTimeMillis() - startTime;
            metricService.incrementCounter("checkout.order", "success", "false", "reason", "validation_error");
            metricService.recordDuration("checkout.order.duration", duration, "success", "false");


            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "error", e.getMessage()
            ));

        } catch (Exception e) {
            long duration = System.currentTimeMillis() - startTime;
            metricService.incrementCounter("checkout.order", "success", "false", "reason", "server_error");
            metricService.recordDuration("checkout.order.duration", duration, "success", "false");

            return ResponseEntity.internalServerError().body(Map.of(
                    "success", false,
                    "error", "Server error while placing order"
            ));
        }
    }
}
