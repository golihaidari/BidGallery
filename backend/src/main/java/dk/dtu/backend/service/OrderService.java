package dk.dtu.backend.service;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import dk.dtu.backend.dto.CartItemDTO;
import dk.dtu.backend.persistence.entity.Address;
import dk.dtu.backend.persistence.entity.Order;
import dk.dtu.backend.persistence.entity.OrderItem;
import dk.dtu.backend.persistence.entity.Product;
import dk.dtu.backend.persistence.entity.User;
import dk.dtu.backend.persistence.repository.OrderRepository;
import jakarta.transaction.Transactional;

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
    public Order placeOrder(User user, List<CartItemDTO> cart, Address shippingAddress, String paymentIntent, String userEmail) {

        loggingService.info("Order placement process started", Map.of(
            "cartSize", String.valueOf(cart.size()),
            "paymentIntent", paymentIntent
        ));
        
        // ------------ 1. Payment Validation ------------
        loggingService.info("Starting payment validation", Map.of(
            "paymentIntent", paymentIntent
        ));

        boolean paymentValid = paymentService.validatePayment(paymentIntent);
        if (!paymentValid) {
            loggingService.error("Order placement failed - payment validation unsuccessful", Map.of(
                "paymentIntent", paymentIntent,
                "reason", "payment_validation_failed"
            ));

            throw new IllegalArgumentException("Payment validation failed or expired");
        }

        loggingService.info("Payment validation completed successfully", Map.of(
            "paymentIntent", paymentIntent
        ));

        // ------------ 2. Create order ------------
        Order order = new Order();
        order.setUser(user);
        order.setOrderDate(LocalDate.now());
        order.setOrderStatus("Paid");

        loggingService.info("Order object created", Map.of(
            "orderStatus", "Paid"
        ));

        // ------------ 3. save address ------------
        Address orderAddress = new Address();
        orderAddress.setAddress1(shippingAddress.getAddress1());
        orderAddress.setAddress2(shippingAddress.getAddress2());
        orderAddress.setCity(shippingAddress.getCity());
        orderAddress.setPostalCode(shippingAddress.getPostalCode());
        orderAddress.setCountry(shippingAddress.getCountry());
        orderAddress.setMobileNr(shippingAddress.getMobileNr());
        orderAddress.setEmail(shippingAddress.getEmail());
        orderAddress.setLastName(shippingAddress.getLastName());
        orderAddress.setFirstName(shippingAddress.getFirstName());

        Address managedAddress = addressService.saveAddress(orderAddress);
        order.setAddress(managedAddress);
        loggingService.info("New address created and linked to order", Map.of(
                "addressId", String.valueOf(managedAddress.getId()),
                "city", managedAddress.getCity()
        ));   

        // ------------ 4. Save order ------------
        Order savedOrder = orderRepository.save(order);
        loggingService.info("Order saved to database", Map.of(
            "orderId", String.valueOf(savedOrder.getId())
        ));

        // ------------ 5. Process order items ------------
        loggingService.info("Starting to process order items", Map.of(
            "orderId", String.valueOf(savedOrder.getId()),
            "itemCount", String.valueOf(cart.size())
        ));

        for (CartItemDTO dto : cart) {
            Product product = productService.getProductById(dto.getProductId())
                    .orElseThrow(() -> {

                        loggingService.error("Order item processing failed - product not found", Map.of(
                            "orderId", String.valueOf(savedOrder.getId()),
                            "productId", String.valueOf(dto.getProductId())
                        ));

                        return new IllegalArgumentException("Product not found: " + dto.getProductId());
                    });

            product.setSold(true);
            productService.saveProduct(product); // updated ProductService method

            OrderItem item = new OrderItem();
            item.setProduct(product);
            item.setPriceAtPurchase(dto.getBidPrice());
            savedOrder.addOrderItem(item);

            loggingService.info("Product added to order successfully", Map.of(
                "orderId", String.valueOf(savedOrder.getId()),
                "productId", String.valueOf(product.getId()),
                "productTitle", product.getTitle(),
                "bidPrice", String.valueOf(dto.getBidPrice())
            ));
        }

        // ------------ 6. Save final order ------------
        Order finalOrder = orderRepository.save(savedOrder);

        loggingService.info("Order placement completed successfully", Map.of(
            "orderId", String.valueOf(finalOrder.getId()),
            "totalItems", String.valueOf(finalOrder.getOrderItems().size()),
            "status", finalOrder.getOrderStatus()
        ));

        return finalOrder;
    }
    
    // ----------------------------- Read -----------------------------

    public List<Order> getAllOrders(){
        List<Order> orders = orderRepository.findAll();
        loggingService.info("Order lookup by ID completed", Map.of(
            "orderSize", String.valueOf(orders.size()))
        );
        return orders;
    }
    public Optional<Order> getOrderById(int id){
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
