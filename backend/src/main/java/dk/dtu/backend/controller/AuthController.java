package dk.dtu.backend.controller;

import dk.dtu.backend.dto.LoginRequestFirebase;
import dk.dtu.backend.dto.RegisterRequest;
import dk.dtu.backend.dto.responses.AddressDTO;
import dk.dtu.backend.persistence.entity.AccountType;
import dk.dtu.backend.persistence.entity.Address;
import dk.dtu.backend.persistence.entity.Artist;
import dk.dtu.backend.persistence.entity.User;
import dk.dtu.backend.security.Protected;
import dk.dtu.backend.security.RoleProtected;
import dk.dtu.backend.service.AddressService;
import dk.dtu.backend.service.AuthService;
import dk.dtu.backend.service.MetricService;
import dk.dtu.backend.utils.CookieUtil;
import dk.dtu.backend.utils.DtoMapper;
import dk.dtu.backend.utils.JwtUtil;
import jakarta.servlet.http.HttpServletRequest;

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
    private AddressService addressService;

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
        if(user.getAccountType() == AccountType.ARTIST){
            if (artist == null){
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "error", "Artist fields are required",
                    "requestId", requestId
                ));
            }
            artist.setUser(user);
            user.setArtist(artist);
        }
        else if(user.getAccountType()== AccountType.CUSTOMER){
            if (address == null) {
                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "error", "address fields are required",
                    "requestId", requestId
                ));
            }
            address.setUser(user);
            user.setAddresses(List.of(address));
        }

        /*
        if (artist != null) {
            artist.setUser(user);
            user.setArtist(artist);
        }
        if (address != null) {
            address.setUser(user);
            user.setAddresses(List.of(address));
        }*/

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

    //------------------------------retrive address for the registered users----------------------
    @GetMapping("/address")
    @Protected
    @RoleProtected(roles = {AccountType.CUSTOMER})
    public ResponseEntity<?> getMyAddress(HttpServletRequest request) {

        long startTime = System.currentTimeMillis();
        String requestId = UUID.randomUUID().toString();

        // Extract token from HttpOnly cookie
        String token = authService.getTokenFromRequest(request);

        if (token == null) {
            metricService.incrementCounter("No token found, authentication", "success", "false");
            return ResponseEntity.status(401).body("No token found");            
        }

        // Identify user using your AuthService
        Optional<User> userOpt = authService.getUserFromToken(token);
        if (userOpt.isEmpty()) {
            metricService.incrementCounter("Invalid token, authentication", "success", "false");
            return ResponseEntity.status(402).body("Invalid token");
        }

        User user = userOpt.get();

        // Fetch address by user ID
        Optional<Address> addressOpt = addressService.getUserAddress(user.getId(), requestId);

        if(addressOpt.isEmpty()){
            metricService.incrementCounter("Address", "success", "false");
            return ResponseEntity.status(403).body("No address found");
        }
        // Map to DTO and return
        AddressDTO addressDTO = DtoMapper.toAddressDTO(addressOpt.get());

        long duration = System.currentTimeMillis() - startTime;
        metricService.recordDuration("address.duration", duration, "success", "true");

        return ResponseEntity.ok(Map.of("address", addressDTO));
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
