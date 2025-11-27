package dk.dtu.backend.controller;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.regex.Pattern;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import dk.dtu.backend.dto.LoginRequestFirebase;
import dk.dtu.backend.dto.RegisterRequest;
import dk.dtu.backend.dto.responses.AddressDTO;
import dk.dtu.backend.persistence.entity.Address;
import dk.dtu.backend.persistence.entity.Artist;
import dk.dtu.backend.persistence.entity.User;
import dk.dtu.backend.service.AddressService;
import dk.dtu.backend.service.AuthService;
import dk.dtu.backend.service.MetricService;
import dk.dtu.backend.utils.CookieUtil;
import dk.dtu.backend.utils.DtoMapper;
import dk.dtu.backend.utils.JwtUtil;
import jakarta.servlet.http.HttpServletRequest;

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
    public ResponseEntity<?> register(@RequestBody RegisterRequest request, HttpServletRequest httpRequest) {

        String correlationId = (String) httpRequest.getAttribute("correlationId"); // For business

        long startTime = System.currentTimeMillis();

        User user = request.getUser();
        user.setAccountType(user.getAccountType().toUpperCase());
        Artist artist = request.getArtist();
        Address address = request.getAddress();

        // Basic validation
        if (user.getEmail() == null || !isValidEmail(user.getEmail())) {
            metricService.incrementCounter("auth.register", 
            "success", "false",
             "reason", "invalid_email",
            "correlationId", correlationId);
            metricService.recordDuration("auth.register.duration", System.currentTimeMillis() - startTime, 
            "success", "false",
            "correlationId", correlationId);
            
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "error", "Invalid email format"
            ));
        }
        if (user.getPassword() == null || user.getPassword().length() < 8) {

            metricService.incrementCounter("auth.register", 
            "success", "false",
             "reason", "invalid_password",
            "correlationId", correlationId);
            metricService.recordDuration("auth.register.duration", System.currentTimeMillis() - startTime, 
            "success", "false",
            "correlationId", correlationId);
            
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "error", "Password must be at least 8 characters"
            ));
        }

        // Link Artist / Address if provided
        if(user.getAccountType().equals("ARTIST")){
            if (artist == null){

                metricService.incrementCounter("auth.register", 
                "success", "false", 
                "reason", "missing_artist",
                "correlationId", correlationId);
                metricService.recordDuration("auth.register.duration", System.currentTimeMillis() - startTime, 
                "success", "false",
                "correlationId", correlationId);

                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "error", "Artist fields are required"
                ));
            }
            artist.setUser(user);
            user.setArtist(artist);
        }
        else if(user.getAccountType().equals( "CUSTOMER")){
            if (address == null) {

                metricService.incrementCounter("auth.register", 
                "success", "false",
                 "reason", "missing_address",
                "correlationId", correlationId);
                metricService.recordDuration("auth.register.duration", System.currentTimeMillis() - startTime, 
                "success", "false",
                "correlationId", correlationId);

                return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "error", "address fields are required"
                ));
            }
            address.setUser(user);
            user.setAddresses(List.of(address));
        }

        // Save user (service handles logging internally)
        boolean success = authService.register(user);
        if (!success) {
            
            metricService.incrementCounter("auth.register", 
            "success", "false", 
            "reason", "duplicate_or_db_error",
            "correlationId", correlationId);
            metricService.recordDuration("auth.register.duration", System.currentTimeMillis() - startTime, 
            "success", "false",
            "correlationId", correlationId);
            
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "error", "Email already registered or DB error"
            ));
        }

        long duration = System.currentTimeMillis() - startTime;
        metricService.incrementCounter("auth.register", 
        "success", "true",
            "correlationId", correlationId);
        metricService.recordDuration("auth.register.duration", duration, 
        "success", "true",
            "correlationId", correlationId);

        return ResponseEntity.ok()
                //.header(HttpHeaders.SET_COOKIE, cookie.toString())
                .body(Map.of(
                        "success", true,
                        "message", "User registered successfully and logged in",
                        "email", user.getEmail()
                ));
    }

    //------------------------------retrive address for the registered users----------------------
    @GetMapping("/address")
    @PreAuthorize("isAuthenticated() and hasRole('CUSTOMER')")
    public ResponseEntity<?> getMyAddress(HttpServletRequest httpRequest) {

        String correlationId = (String) httpRequest.getAttribute("correlationId"); // For business

        long startTime = System.currentTimeMillis();
        
        User user = authService.getAuthenticatedUser();
        
        if (user == null) {
            metricService.incrementCounter("auth.address.fetch", 
            "success", "false", 
            "reason", "invalid_token",
            "correlationId", correlationId);
            metricService.recordDuration("auth.address.fetch.duration", System.currentTimeMillis() - startTime, 
            "success", "false",
            "correlationId", correlationId);
            
            return ResponseEntity.status(402).body("Invalid token");
        }

        
        // Fetch address by user ID
        Optional<Address> addressOpt = addressService.getUserAddress(user.getId());

        if(addressOpt.isEmpty()){
            metricService.incrementCounter("auth.address.fetch", 
            "success", "false",
             "reason", "no_address",
            "correlationId", correlationId);
            metricService.recordDuration("auth.address.fetch.duration", System.currentTimeMillis() - startTime, 
            "success", "false",
            "correlationId", correlationId);

            return ResponseEntity.status(403).body("No address found");
        }

        long duration = System.currentTimeMillis() - startTime;
        metricService.incrementCounter("auth.address.fetch", 
        "success", "true",
            "correlationId", correlationId);
        metricService.recordDuration("auth.address.fetch.duration", duration, 
        "success", "true",
            "correlationId", correlationId);

        // Map to DTO and return
        AddressDTO addressDTO = DtoMapper.toAddressDTO(addressOpt.get());
        return ResponseEntity.ok(Map.of("address", addressDTO));
    }

    // -----------------------------EMAIL/PASSWORD LOGIN-----------------------------
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> credentials, 
                                                    HttpServletRequest httpRequest) {
        
        String correlationId = (String) httpRequest.getAttribute("correlationId"); // For business

        long startTime = System.currentTimeMillis();

        String email = credentials.get("email");
        String password = credentials.get("password");

        if (email == null || password == null || email.isEmpty() || password.isEmpty()) {
            metricService.incrementCounter("auth.login", 
            "success", "false",
            "reason", "missing_credentials",
            "correlationId", correlationId);
            metricService.recordDuration("auth.login.duration", System.currentTimeMillis() - startTime, 
            "success", "false",
            "correlationId", correlationId);

            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "error", "Email and password are required"
            ));
        }

        Optional<String> tokenOpt = authService.login(email, password);
        if (tokenOpt.isEmpty()) {
            metricService.incrementCounter("auth.login", 
            "success", "false", 
            "reason", "invalid_credentials",
            "correlationId", correlationId);
            metricService.recordDuration("auth.login.duration", System.currentTimeMillis() - startTime, 
            "success", "false",
            "correlationId", correlationId);

            return ResponseEntity.status(401).body(Map.of(
                    "success", false,
                    "error", "Invalid credentials"
            ));
        }

        long duration = System.currentTimeMillis() - startTime;
        metricService.incrementCounter("auth.login", 
        "success", "true",
            "correlationId", correlationId);
        metricService.recordDuration("auth.login.duration", duration, 
        "success", "true",
            "correlationId", correlationId);

        ResponseCookie cookie = CookieUtil.createJwtCookie(tokenOpt.get());
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                .body(Map.of(
                        "success", true,
                        "message", "Login successful",
                        "email", email
                ));
    }

    // -----------------------------FIREBASE LOGIN-----------------------------
    @PostMapping("/login/firebase")
    public ResponseEntity<?> loginWithFirebase(@RequestBody LoginRequestFirebase request, HttpServletRequest httpRequest) {
        String correlationId = (String) httpRequest.getAttribute("correlationId"); // For business

        long startTime = System.currentTimeMillis();

        String idToken = request.getToken();

        if (idToken == null || idToken.isBlank()) {
            metricService.incrementCounter("auth.login.firebase", 
            "success", "false", 
            "reason", "missing_token",
            "correlationId", correlationId);
            metricService.recordDuration("auth.login.firebase.duration", System.currentTimeMillis() - startTime, 
            "success", "false",
            "correlationId", correlationId);

            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "error", "Missing idToken"
            ));
        }

        Optional<String> tokenOpt = authService.loginWithFirebase(idToken);
        if (tokenOpt.isEmpty()) {
            metricService.incrementCounter("auth.login.firebase", 
            "success", "false", 
            "reason", "invalid_token",
            "correlationId", correlationId);
            metricService.recordDuration("auth.login.firebase.duration", System.currentTimeMillis() - startTime,
             "success", "false",
             "correlationId", correlationId);

            return ResponseEntity.status(401).body(Map.of(
                    "success", false,
                    "error", "Invalid Firebase token"
            ));
        }

        long duration = System.currentTimeMillis() - startTime;
        metricService.incrementCounter("auth.login.firebase", 
        "success", "true",
        "correlationId", correlationId);
        metricService.recordDuration("auth.login.firebase.duration", duration, 
        "success", "true",
        "correlationId", correlationId);

        ResponseCookie cookie = CookieUtil.createJwtCookie(tokenOpt.get());
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                .body(Map.of(
                        "success", true,
                        "email", JwtUtil.getEmailFromToken(tokenOpt.get()),
                        "message", "Login successful"
                ));
    }

    // -----------------------------LOGOUT-----------------------------
    @GetMapping("/logout")
    public ResponseEntity<?> logout(HttpServletRequest httpRequest) {
        String correlationId = (String) httpRequest.getAttribute("correlationId"); 

        metricService.incrementCounter("auth.logout", 
        "success", "true",
        "correlationId", correlationId);

        ResponseCookie cookie = CookieUtil.clearJwtCookie();
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                .body(Map.of(
                        "success", true,
                        "message", "Logged out successfully"
                ));
    }

    // -----------------------------check: trigger on refresh request-----------------------------
    @GetMapping("/check")
    public ResponseEntity<?> checkAuthentication() {
        User user = authService.getAuthenticatedUser();
        
        if (user == null) {
            return ResponseEntity.status(401).body(Map.of("authenticated", false));
        }
        
        return ResponseEntity.ok(Map.of(
            "authenticated", true,
            "email", user.getEmail()
        ));
    }

    // -----------------------------HELPER-----------------------------
    private boolean isValidEmail(String email) {
        String regex = "^[A-Za-z0-9+_.-]+@(.+)$";
        return Pattern.compile(regex).matcher(email).matches();
    }

    
}
