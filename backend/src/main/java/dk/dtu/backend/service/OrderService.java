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
    public Order placeOrder(User user, List<CartItemDTO> cart, Address address, String paymentIntent, String userEmail, String requestId) {

        loggingService.info("Order placement process started", Map.of(
            "userEmail", userEmail,
            "cartSize", String.valueOf(cart.size()),
            "paymentIntent", paymentIntent,
            "requestId", requestId
        ));
        
        // ------------ 1. Payment Validation ------------
        loggingService.info("Starting payment validation", Map.of(
            "paymentIntent", paymentIntent,
            "requestId", requestId
        ));

        boolean paymentValid = paymentService.validatePayment(paymentIntent);
        if (!paymentValid) {
            loggingService.error("Order placement failed - payment validation unsuccessful", Map.of(
                "paymentIntent", paymentIntent,
                "userEmail", userEmail,
                "requestId", requestId,
                "reason", "payment_validation_failed"
            ));

            throw new IllegalArgumentException("Payment validation failed or expired");
        }

        loggingService.info("Payment validation completed successfully", Map.of(
            "paymentIntent", paymentIntent,
            "requestId", requestId
        ));

        // ------------ 2. Create order ------------
        Order order = new Order();
        order.setUser(user);
        order.setOrderDate(LocalDate.now());
        order.setOrderStatus("Paid");

        loggingService.info("Order object created", Map.of(
            "userEmail", userEmail,
            "orderStatus", "Paid",
            "requestId", requestId
        ));

        // ------------ 3. Reuse or save address ------------
        Optional<Address> existingAddress = addressService.findByAddressFields(
                address.getAddress1(), address.getCity(), address.getPostalCode()
        );

        Address managedAddress;
        if (existingAddress.isPresent()) {
            managedAddress = existingAddress.get();
            loggingService.info("Reusing existing address for order", Map.of(
                "addressId", String.valueOf(managedAddress.getId()),
                "city", managedAddress.getCity(),
                "userEmail", userEmail,
                "requestId", requestId
            ));
        } else {
            if (user != null) address.setUser(user);
            managedAddress = addressService.saveAddress(address);
            loggingService.info("New address created and linked to order", Map.of(
                "addressId", String.valueOf(managedAddress.getId()),
                "city", managedAddress.getCity(),
                "userEmail", userEmail,
                "requestId", requestId
            ));
        }

        order.setAddress(managedAddress);

        // ------------ 4. Save order ------------
        Order savedOrder = orderRepository.save(order);
        loggingService.info("Order saved to database", Map.of(
            "orderId", String.valueOf(savedOrder.getId()),
            "userEmail", userEmail,
            "requestId", requestId
        ));

        // ------------ 5. Process order items ------------
        loggingService.info("Starting to process order items", Map.of(
            "orderId", String.valueOf(savedOrder.getId()),
            "itemCount", String.valueOf(cart.size()),
            "requestId", requestId
        ));

        for (CartItemDTO dto : cart) {
            Product product = productService.getProductById(dto.getProductId())
                    .orElseThrow(() -> {

                        loggingService.error("Order item processing failed - product not found", Map.of(
                            "orderId", String.valueOf(savedOrder.getId()),
                            "productId", String.valueOf(dto.getProductId()),
                            "userEmail", userEmail,
                            "requestId", requestId
                        ));

                        return new IllegalArgumentException("Product not found: " + dto.getProductId());
                    });

            product.setSold(true);
            productService.saveProduct(product, userEmail, requestId); // updated ProductService method

            OrderItem item = new OrderItem();
            item.setProduct(product);
            item.setPriceAtPurchase(dto.getBidPrice());
            savedOrder.addOrderItem(item);

            loggingService.info("Product added to order successfully", Map.of(
                "orderId", String.valueOf(savedOrder.getId()),
                "productId", String.valueOf(product.getId()),
                "productTitle", product.getTitle(),
                "bidPrice", String.valueOf(dto.getBidPrice()),
                "userEmail", userEmail,
                "requestId", requestId
            ));
        }

        // ------------ 6. Save final order ------------
        Order finalOrder = orderRepository.save(savedOrder);

        loggingService.info("Order placement completed successfully", Map.of(
            "orderId", String.valueOf(finalOrder.getId()),
            "userEmail", userEmail,
            "totalItems", String.valueOf(finalOrder.getOrderItems().size()),
            "status", finalOrder.getOrderStatus(),
            "requestId", requestId
        ));

        return finalOrder;
    }

    // ----------------------------- READ -----------------------------
    public List<Order> getAllOrders() {
        List<Order> orders = orderRepository.findAll();
        loggingService.info("Fetched all orders from database", Map.of(
            "totalOrders", String.valueOf(orders.size())
        ));
        return orders;
    }

    public Optional<Order> getOrderById(Integer id) {
        Optional<Order> order = orderRepository.findById(id);
        loggingService.info("Order lookup by ID completed", Map.of(
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

}
