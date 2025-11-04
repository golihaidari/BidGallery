package dk.dtu.backend.controller;

import dk.dtu.backend.persistence.entity.User;
import dk.dtu.backend.service.AuthService;
import dk.dtu.backend.service.UserService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserService userService;

    @Autowired
    AuthService authService;

    //// ----------------------------READ------------------------------
    // Admin can get all users
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    // Admin can get user by email
    @GetMapping("/{email}")
    @PreAuthorize("hasAnyRole('ADMIN, 'CUSTOMER', 'ARTIST')")
    public ResponseEntity<?> getUser(@PathVariable String email) {

        Optional<User> user = userService.getUserByEmail(email);
        return user.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // ----------------------------UPDATE------------------------------
    // Admin can update user by email
    @PutMapping("/{email}")
    @PreAuthorize("hasAnyRole('ADMIN', 'CUSTOMER')")
    public ResponseEntity<?> updateUser(@PathVariable String email, @RequestBody User updatedUser) {
        try {
            Optional<User> user = userService.updateUser(email, updatedUser);
            return ResponseEntity.ok(user.orElseThrow(() -> new RuntimeException("User not found")));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // ----------------------------DELETE------------------------------
    // Admin can delete user by email
    @DeleteMapping("/{email}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteUser(@PathVariable String email) {
        try {
            userService.deleteUser(email);
            return ResponseEntity.ok("User deleted successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
