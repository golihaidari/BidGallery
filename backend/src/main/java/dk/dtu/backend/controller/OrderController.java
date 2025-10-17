package dk.dtu.backend.controller;

import dk.dtu.backend.persistence.entity.Order;
import dk.dtu.backend.security.RoleProtected;
import dk.dtu.backend.service.OrderService;
import dk.dtu.backend.persistence.entity.AccountType;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


import java.util.Map;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    @Autowired
    private OrderService orderService;

    // ----------------------------READ------------------------------
    @RoleProtected(roles = {AccountType.ADMIN})
    @GetMapping
    public ResponseEntity<?> getAllOrders() {
        return ResponseEntity.ok(orderService.getAllOrders());
    }

    @RoleProtected(roles = {AccountType.ADMIN, AccountType.ARTIST})
    @GetMapping("/{id}")
    public ResponseEntity<?> getOrderById(@PathVariable Integer id) {
        return orderService.getOrderById(id)
                .<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.status(404).body(Map.of(
                        "success", false,
                        "error", "Order not found"
                )));
    }

    // ----------------------------UPDATE------------------------------
    @RoleProtected(roles = {AccountType.ADMIN, AccountType.ARTIST})
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
    @RoleProtected(roles = {AccountType.ADMIN})
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
