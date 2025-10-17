package dk.dtu.backend.service;

import dk.dtu.backend.dto.CartItemDTO;
import dk.dtu.backend.persistence.entity.*;
import dk.dtu.backend.persistence.repository.OrderRepository;
import jakarta.transaction.Transactional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.*;

@Service
public class OrderService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private AddressService addressService;

    @Autowired
    private ProductService productService;

    @Autowired
    private PaymentService paymentService;

    @Autowired
    private LoggingService loggingService;

    // ----------------------------- PLACE ORDER -----------------------------
    @Transactional
    public Order placeOrder(User user, List<CartItemDTO> cart, Address address, String paymentIntent,
                            String userEmail, String requestId) {

        Map<String, String> mdc = Map.of(
                "userEmail", userEmail != null ? userEmail : "guest",
                "requestId", requestId
        );

        loggingService.info("Validating payment intent", mergeMaps(mdc, Map.of("paymentIntent", paymentIntent)));

        boolean paymentValid = paymentService.validatePayment(paymentIntent);
        if (!paymentValid) {
            loggingService.warn("Payment validation failed", mergeMaps(mdc, Map.of("paymentIntent", paymentIntent)));
            throw new IllegalArgumentException("Payment validation failed or expired");
        }

        loggingService.info("Payment validated successfully", mergeMaps(mdc, Map.of("paymentIntent", paymentIntent)));

        // ------------ 1. Create order ------------
        Order order = new Order();
        order.setUser(user);
        order.setOrderDate(LocalDate.now());
        order.setOrderStatus("Paid");

        // ------------ 2. Reuse or save address ------------
        Optional<Address> existingAddress = addressService.findByAddressFields(
                address.getAddress1(), address.getCity(), address.getPostalCode()
        );

        Address managedAddress;
        if (existingAddress.isPresent()) {
            managedAddress = existingAddress.get();
            loggingService.info("Reusing existing address", mergeMaps(mdc, Map.of(
                    "address1", address.getAddress1(),
                    "city", address.getCity(),
                    "postalCode", address.getPostalCode()
            )));
        } else {
            if (user != null) address.setUser(user);
            managedAddress = addressService.saveAddress(address);
            loggingService.info("Saved new address", mergeMaps(mdc, Map.of(
                    "address1", address.getAddress1(),
                    "city", address.getCity(),
                    "postalCode", address.getPostalCode()
            )));
        }

        order.setAddress(managedAddress);

        // ------------ 3. Save order ------------
        Order savedOrder = orderRepository.save(order);
        loggingService.info("Order saved successfully", mergeMaps(mdc, Map.of(
                "orderId", String.valueOf(savedOrder.getId())
        )));

        // ------------ 4. Add order items ------------
        for (CartItemDTO dto : cart) {
            Product product = productService.getProductById(dto.getProductId())
                    .orElseThrow(() -> {
                        loggingService.error("Product not found while placing order", mergeMaps(mdc, Map.of(
                                "productId", String.valueOf(dto.getProductId())
                        )));
                        return new IllegalArgumentException("Product not found: " + dto.getProductId());
                    });

            product.setSold(true);
            productService.saveProduct(product, userEmail, requestId); // updated ProductService method

            OrderItem item = new OrderItem();
            item.setProduct(product);
            item.setPriceAtPurchase(dto.getBidPrice());
            savedOrder.addOrderItem(item);

            loggingService.info("Added product to order", mergeMaps(mdc, Map.of(
                    "orderId", String.valueOf(savedOrder.getId()),
                    "productId", String.valueOf(product.getId()),
                    "bidPrice", String.valueOf(dto.getBidPrice())
            )));
        }

        // ------------ 5. Save final order ------------
        Order finalOrder = orderRepository.save(savedOrder);
        loggingService.info("Order completed successfully", mergeMaps(mdc, Map.of(
                "orderId", String.valueOf(finalOrder.getId()),
                "totalItems", String.valueOf(finalOrder.getOrderItems().size()),
                "status", finalOrder.getOrderStatus()
        )));

        return finalOrder;
    }

    // ----------------------------- READ -----------------------------
    public List<Order> getAllOrders() {
        List<Order> orders = orderRepository.findAll();
        loggingService.info("Fetched all orders", Map.of(
                "count", String.valueOf(orders.size())
        ));
        return orders;
    }

    public Optional<Order> getOrderById(Integer id) {
        Optional<Order> order = orderRepository.findById(id);
        loggingService.info("Fetched order by ID", Map.of(
                "orderId", String.valueOf(id),
                "found", String.valueOf(order.isPresent())
        ));
        return order;
    }

    // ----------------------------- UPDATE -----------------------------
    public Optional<Order> updateOrder(Integer id, Order updatedOrder) {
        Optional<Order> optionalOrder = orderRepository.findById(id);
        if (optionalOrder.isEmpty()) {
            loggingService.warn("Attempted to update non-existing order", Map.of(
                    "orderId", String.valueOf(id)
            ));
            return Optional.empty();
        }

        Order existing = optionalOrder.get();
        existing.setOrderStatus(updatedOrder.getOrderStatus());
        existing.setOrderItems(updatedOrder.getOrderItems());
        Order saved = orderRepository.save(existing);

        loggingService.info("Order updated successfully", Map.of(
                "orderId", String.valueOf(saved.getId()),
                "newStatus", saved.getOrderStatus()
        ));
        return Optional.of(saved);
    }

    // ----------------------------- DELETE -----------------------------
    public boolean deleteOrder(Integer id) {
        if (!orderRepository.existsById(id)) {
            loggingService.warn("Attempted to delete non-existing order", Map.of(
                    "orderId", String.valueOf(id)
            ));
            return false;
        }

        orderRepository.deleteById(id);
        loggingService.info("Order deleted successfully", Map.of(
                "orderId", String.valueOf(id),
                "action", "delete"
        ));
        return true;
    }

    // ----------------------------- Helper: Merge MDC -----------------------------
    private Map<String, String> mergeMaps(Map<String, String> a, Map<String, String> b) {
        Map<String, String> merged = new HashMap<>(a);
        merged.putAll(b);
        return merged;
    }
}
