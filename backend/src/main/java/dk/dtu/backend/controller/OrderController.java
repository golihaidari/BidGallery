package dk.dtu.backend.controller;

import dk.dtu.backend.persistence.entity.Order;
import dk.dtu.backend.service.OrderService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;


import java.util.Map;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    @Autowired
    private OrderService orderService;

    // ----------------------------READ------------------------------
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping
    public ResponseEntity<?> getAllOrders() {
        return ResponseEntity.ok(orderService.getAllOrders());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'Artist')")
    public ResponseEntity<?> getOrderById(@PathVariable Integer id) {
        return orderService.getOrderById(id)
                .<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.status(404).body(Map.of(
                        "success", false,
                        "error", "Order not found"
                )));
    }

    // ----------------------------UPDATE------------------------------
    @PreAuthorize("hasAnyRole('ADMIN', 'ARTIST')")
    @PutMapping("/{id}")
    public ResponseEntity<?> updateOrder(@PathVariable Integer id, @RequestBody Order updatedOrder) {
        return orderService.updateOrder(id, updatedOrder)
                .<ResponseEntity<?>>map(order -> ResponseEntity.ok(Map.of(
                        "success", true,
                        "message", "Order updated",
                        "orderId", order.getId()
                )))
                .orElseGet(() -> ResponseEntity.status(404).body(Map.of(
                        "success", false,
                        "error", "Order not found"
                )));
    }

    // ----------------------------DELETE------------------------------
    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteOrder(@PathVariable Integer id) {
        if (orderService.deleteOrder(id)) {
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Order deleted"
            ));
        }
        return ResponseEntity.status(404).body(Map.of(
                "success", false,
                "error", "Order not found"
        ));
    }
}
