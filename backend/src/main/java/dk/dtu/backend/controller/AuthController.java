package dk.dtu.backend.controller;

import dk.dtu.backend.dto.LoginRequestFirebase;
import dk.dtu.backend.dto.RegisterRequest;
import dk.dtu.backend.persistence.entity.Address;
import dk.dtu.backend.persistence.entity.Artist;
import dk.dtu.backend.persistence.entity.User;
import dk.dtu.backend.service.AuthService;
import dk.dtu.backend.service.MetricService;
import dk.dtu.backend.utils.CookieUtil;
import dk.dtu.backend.utils.JwtUtil;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.regex.Pattern;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @Autowired
    private MetricService metricService;

    // ----------------------------REGISTER------------------------------
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {

        String requestId = UUID.randomUUID().toString();

        User user = request.getUser();
        Artist artist = request.getArtist();
        Address address = request.getAddress();

        // Basic validation
        if (user.getEmail() == null || !isValidEmail(user.getEmail())) {
            metricService.incrementCounter("auth.register.fail", "requestId", requestId);
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "error", "Invalid email format",
                    "requestId", requestId
            ));
        }
        if (user.getPassword() == null || user.getPassword().length() < 6) {
            metricService.incrementCounter("auth.register.fail", "requestId", requestId);
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "error", "Password must be at least 6 characters",
                    "requestId", requestId
            ));
        }

        // Link Artist / Address if provided
        if (artist != null) {
            artist.setUser(user);
            user.setArtist(artist);
        }
        if (address != null) {
            address.setUser(user);
            user.setAddresses(List.of(address));
        }

        // Save user (service handles logging internally)
        boolean success = authService.register(user, requestId);
        if (!success) {
            metricService.incrementCounter("auth.register.fail", "requestId", requestId);
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "error", "Email already registered or DB error",
                    "requestId", requestId
            ));
        }

        metricService.incrementCounter("auth.register.success", "requestId", requestId);

        // Generate JWT
        String token = JwtUtil.generateToken(user.getEmail(), user.getAccountType());
        ResponseCookie cookie = CookieUtil.createJwtCookie(token);

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                .body(Map.of(
                        "success", true,
                        "message", "User registered successfully and logged in",
                        "email", user.getEmail(),
                        "requestId", requestId
                ));
    }

    // -----------------------------EMAIL/PASSWORD LOGIN-----------------------------
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> credentials) {
        String requestId = UUID.randomUUID().toString();
        String email = credentials.get("email");
        String password = credentials.get("password");

        if (email == null || password == null || email.isEmpty() || password.isEmpty()) {
            metricService.incrementCounter("auth.login.fail", "requestId", requestId);
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "error", "Email and password are required",
                    "requestId", requestId
            ));
        }

        Optional<String> tokenOpt = authService.login(email, password, requestId);
        if (tokenOpt.isEmpty()) {
            metricService.incrementCounter("auth.login.fail", "requestId", requestId);
            return ResponseEntity.status(401).body(Map.of(
                    "success", false,
                    "error", "Invalid credentials",
                    "requestId", requestId
            ));
        }

        metricService.incrementCounter("auth.login.success", "requestId", requestId);

        ResponseCookie cookie = CookieUtil.createJwtCookie(tokenOpt.get());
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                .body(Map.of(
                        "success", true,
                        "message", "Login successful",
                        "email", email,
                        "requestId", requestId
                ));
    }

    // -----------------------------FIREBASE LOGIN-----------------------------
    @PostMapping("/login/firebase")
    public ResponseEntity<?> loginWithFirebase(@RequestBody LoginRequestFirebase request) {
        String requestId = UUID.randomUUID().toString();
        String idToken = request.getToken();

        if (idToken == null || idToken.isBlank()) {
            metricService.incrementCounter("auth.login.firebase.fail", "requestId", requestId);
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "error", "Missing idToken",
                    "requestId", requestId
            ));
        }

        Optional<String> tokenOpt = authService.loginWithFirebase(idToken, requestId);
        if (tokenOpt.isEmpty()) {
            metricService.incrementCounter("auth.login.firebase.fail", "requestId", requestId);
            return ResponseEntity.status(401).body(Map.of(
                    "success", false,
                    "error", "Invalid Firebase token",
                    "requestId", requestId
            ));
        }

        metricService.incrementCounter("auth.login.firebase.success", "requestId", requestId);

        ResponseCookie cookie = CookieUtil.createJwtCookie(tokenOpt.get());
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                .body(Map.of(
                        "success", true,
                        "email", JwtUtil.getEmailFromToken(tokenOpt.get()),
                        "message", "Login successful",
                        "requestId", requestId
                ));
    }

    // -----------------------------LOGOUT-----------------------------
    @PostMapping("/logout")
    public ResponseEntity<?> logout() {
        String requestId = UUID.randomUUID().toString();
        metricService.incrementCounter("auth.logout.success", "requestId", requestId);

        ResponseCookie cookie = CookieUtil.clearJwtCookie();
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                .body(Map.of(
                        "success", true,
                        "message", "Logged out successfully",
                        "requestId", requestId
                ));
    }

    // -----------------------------HELPER-----------------------------
    private boolean isValidEmail(String email) {
        String regex = "^[A-Za-z0-9+_.-]+@(.+)$";
        return Pattern.compile(regex).matcher(email).matches();
    }
}
