package dk.dtu.backend.service;

import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseAuthException;
import com.google.firebase.auth.FirebaseToken;

import dk.dtu.backend.persistence.entity.User;
import dk.dtu.backend.persistence.entity.AccountType;
import dk.dtu.backend.persistence.repository.UserRepository;
import dk.dtu.backend.utils.JwtUtil;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.Arrays;
import java.util.Map;
import java.util.Optional;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private LoggingService loggingService;

    // ------------------------- Email/Password login -------------------------
    public Optional<String> login(String email, String rawPassword, String requestId) {
        Optional<User> userOpt = userRepository.findByEmail(email);

        if (userOpt.isPresent()) {
            User user = userOpt.get();
            String storedPassword = user.getPassword();

            if (storedPassword != null && encryptPassword(rawPassword).equals(storedPassword)) {
                String token = JwtUtil.generateToken(user.getEmail(), user.getAccountType());
                loggingService.info("User authentication successful", Map.of(
                        "email", email,
                        "accountType", user.getAccountType().name(),
                        "requestId", requestId
                ));
                return Optional.of(token);
            } else {
                loggingService.warn("Authentication failed - invalid password", Map.of(
                        "email", email,
                        "requestId", requestId,
                        "reason", "invalid_credentials"
                ));
            }
        } else {
            loggingService.warn("Authentication failed - user not found", Map.of(
                    "email", email,
                    "requestId", requestId,
                    "reason", "user_not_found"
            ));
        }

        return Optional.empty();
    }

    // ------------------------- Email/Password registration -------------------------
    public boolean register(User user, String requestId) {
        loggingService.info("User registration started", Map.of(
            "email", user.getEmail(),
            "accountType", user.getAccountType().name(),
            "requestId", requestId
        ));

        Optional<User> existingUser = userRepository.findByEmail(user.getEmail());
        if (existingUser.isPresent()) {
            loggingService.warn("Registration failed - email already exists", Map.of(
                    "email", user.getEmail(),
                    "requestId", requestId,
                    "reason", "duplicate_email"
            ));
            return false;
        }

        if (user.getAccountType() == null){
            user.setAccountType(AccountType.GOOGLE);
            loggingService.info("Default account type assigned", Map.of(
                "email", user.getEmail(),
                "assignedType", "GOOGLE",
                "requestId", requestId
            ));
        }

        if (user.getPassword() != null) {
            user.setPassword(encryptPassword(user.getPassword()));
            loggingService.debug("Password encrypted for registration", Map.of(
                "email", user.getEmail(),
                "requestId", requestId
            ));
        }

        try {
            userRepository.save(user); // cascades Artist/Address automatically
            loggingService.info("User registration completed successfully", Map.of(
                    "email", user.getEmail(),
                    "accountType", user.getAccountType().name(),
                    "requestId", requestId
            ));
            return true;
        } catch (Exception e) {
            loggingService.error("User registration failed - database error", Map.of(
                    "email", user.getEmail(),
                    "error", e.getMessage(),
                    "requestId", requestId
            ));
            return false;
        }
    }

    // ------------------------- Firebase Google login -------------------------
    public Optional<String> loginWithFirebase(String idToken, String requestId) {
        loggingService.info("Firebase authentication started", Map.of(
            "requestId", requestId,
            "authMethod", "firebase_google"
        ));

        try {
            FirebaseToken decodedToken = FirebaseAuth.getInstance().verifyIdToken(idToken);
            String email = decodedToken.getEmail();

            Optional<User> userOpt = userRepository.findByEmail(email);
            User user = userOpt.orElseGet(() -> {
                User newUser = new User();
                newUser.setEmail(email);
                newUser.setAccountType(AccountType.GOOGLE);
                userRepository.save(newUser);
                loggingService.info("New user created via Firebase authentication", Map.of(
                        "email", email,
                        "requestId", requestId
                ));
                return newUser;
            });

            String token = JwtUtil.generateToken(user.getEmail(), user.getAccountType());
            loggingService.info("Firebase authentication completed successfully", Map.of(
                    "email", email,
                    "requestId", requestId
            ));
            return Optional.of(token);

        } catch (FirebaseAuthException e) {
            loggingService.error("Firebase authentication failed - token verification error", Map.of(
                    "error", e.getMessage(),
                    "requestId", requestId
            ));
            return Optional.empty();
        }
    }

    // ------------------------- Helper: encrypt password -------------------------
    private String encryptPassword(String rawPassword) {
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            byte[] hash = md.digest(rawPassword.getBytes());
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) hexString.append('0');
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (NoSuchAlgorithmException e) {
            loggingService.error("Password encryption algorithm not available", Map.of(
                    "error", e.getMessage(),
                    "algorithm", "SHA-256"
            ));
            return null;
        }
    }

    // ------------------------- Get user from JWT token -------------------------
    public Optional<User> getUserFromToken(String token) {
        if (token == null || token.isBlank()) return Optional.empty();

        String email = JwtUtil.getEmailFromToken(token); // decode JWT
        if (email == null) return Optional.empty();

        return userRepository.findByEmail(email);
    }

    // Extract token from JWT in HttpServletRequest
    public String getTokenFromRequest(HttpServletRequest request) {
        String token = Arrays.stream(Optional.ofNullable(request.getCookies()).orElse(new Cookie[0]))
                .filter(c -> "jwt".equals(c.getName()))
                .map(Cookie::getValue)
                .findFirst()
                .orElse(null);
        return token;
    }

}
