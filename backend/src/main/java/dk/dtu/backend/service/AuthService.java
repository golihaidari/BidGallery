package dk.dtu.backend.service;

import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseAuthException;
import com.google.firebase.auth.FirebaseToken;

import dk.dtu.backend.persistence.entity.User;
import dk.dtu.backend.persistence.entity.AccountType;
import dk.dtu.backend.persistence.repository.UserRepository;
import dk.dtu.backend.utils.JwtUtil;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
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
                loggingService.info("User login successful", Map.of(
                        "email", email,
                        "accountType", user.getAccountType().name(),
                        "requestId", requestId
                ));
                return Optional.of(token);
            } else {
                loggingService.warn("Invalid password attempt", Map.of(
                        "email", email,
                        "requestId", requestId
                ));
            }
        } else {
            loggingService.warn("Login attempt with non-existing email", Map.of(
                    "email", email,
                    "requestId", requestId
            ));
        }

        return Optional.empty();
    }

    // ------------------------- Email/Password registration -------------------------
    public boolean register(User user, String requestId) {
        Optional<User> existingUser = userRepository.findByEmail(user.getEmail());
        if (existingUser.isPresent()) {
            loggingService.warn("Attempted registration with existing email", Map.of(
                    "email", user.getEmail(),
                    "requestId", requestId
            ));
            return false;
        }

        if (user.getAccountType() == null) user.setAccountType(AccountType.GOOGLE);

        if (user.getPassword() != null) {
            user.setPassword(encryptPassword(user.getPassword()));
        }

        try {
            userRepository.save(user); // cascades Artist/Address automatically
            loggingService.info("User registered successfully", Map.of(
                    "email", user.getEmail(),
                    "accountType", user.getAccountType().name(),
                    "requestId", requestId
            ));
            return true;
        } catch (Exception e) {
            loggingService.error("Error registering new user", Map.of(
                    "email", user.getEmail(),
                    "error", e.getMessage(),
                    "requestId", requestId
            ));
            return false;
        }
    }

    // ------------------------- Firebase Google login -------------------------
    public Optional<String> loginWithFirebase(String idToken, String requestId) {
        try {
            FirebaseToken decodedToken = FirebaseAuth.getInstance().verifyIdToken(idToken);
            String email = decodedToken.getEmail();

            Optional<User> userOpt = userRepository.findByEmail(email);
            User user = userOpt.orElseGet(() -> {
                User newUser = new User();
                newUser.setEmail(email);
                newUser.setAccountType(AccountType.GOOGLE);
                userRepository.save(newUser);
                loggingService.info("New Google user created", Map.of(
                        "email", email,
                        "requestId", requestId
                ));
                return newUser;
            });

            String token = JwtUtil.generateToken(user.getEmail(), user.getAccountType());
            loggingService.info("Google user logged in successfully", Map.of(
                    "email", email,
                    "requestId", requestId
            ));
            return Optional.of(token);

        } catch (FirebaseAuthException e) {
            loggingService.error("Firebase token verification failed", Map.of(
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
            loggingService.error("Password encryption failed", Map.of(
                    "error", e.getMessage()
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
}
