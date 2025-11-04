package dk.dtu.backend.service;

import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseAuthException;
import com.google.firebase.auth.FirebaseToken;

import dk.dtu.backend.persistence.entity.User;
import dk.dtu.backend.persistence.repository.UserRepository;
import dk.dtu.backend.utils.JwtUtil;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private LoggingService loggingService;

    // ------------------------- Email/Password login -------------------------
    public Optional<String> login(String email, String rawPassword) {
        
        Optional<User> userOpt = userRepository.findByEmail(email);

        if (userOpt.isPresent()) {
            User user = userOpt.get();
            String storedPassword = user.getPassword();

            if (storedPassword != null && encryptPassword(rawPassword).equals(storedPassword)) {
                String token = JwtUtil.generateToken(user.getEmail(), user.getAccountType(), user.getId());
                loggingService.info("User authentication successful", Map.of(
                        "email", email,
                        "accountType", user.getAccountType()
                ));
                return Optional.of(token);
            } else {
                loggingService.warn("Authentication failed - invalid password", Map.of(
                        "email", email,
                        "reason", "invalid_credentials"
                ));
            }
        } else {
            loggingService.warn("Authentication failed - user not found", Map.of(
                    "email", email,
                    "reason", "user_not_found"
            ));
        }

        return Optional.empty();
    }

    // ------------------------- Email/Password registration -------------------------
    public boolean register(User user) {
        loggingService.info("User registration started", Map.of(
            "email", user.getEmail(),
            "accountType", user.getAccountType()
        ));

        Optional<User> existingUser = userRepository.findByEmail(user.getEmail());
        if (existingUser.isPresent()) {
            loggingService.warn("Registration failed - email already exists", Map.of(
                    "email", user.getEmail(),
                    "reason", "duplicate_email"
            ));
            return false;
        }

        if (user.getAccountType() == null ){
            user.setAccountType("GOOGLE");
            loggingService.info("Default account type assigned", Map.of(
                "email", user.getEmail(),
                "assignedType", "GOOGLE"
            ));
        }

        if (user.getPassword() != null) {
            user.setPassword(encryptPassword(user.getPassword()));
            loggingService.debug("Password encrypted for registration", Map.of(
                "email", user.getEmail()
            ));
        }

        try {
            userRepository.save(user); // cascades Artist/Address automatically
            loggingService.info("User registration completed successfully", Map.of(
                    "email", user.getEmail(),
                    "accountType", user.getAccountType()
            ));
            return true;
        } catch (Exception e) {
            loggingService.error("User registration failed - database error", Map.of(
                    "email", user.getEmail(),
                    "error", e.getMessage()
            ));
            return false;
        }
    }

    // ------------------------- Firebase Google login -------------------------
    public Optional<String> loginWithFirebase(String idToken) {
        loggingService.info("Firebase authentication started", Map.of(
            "authMethod", "firebase_google"
        ));

        try {
            FirebaseToken decodedToken = FirebaseAuth.getInstance().verifyIdToken(idToken);
            String email = decodedToken.getEmail();

            Optional<User> userOpt = userRepository.findByEmail(email);
            User user = userOpt.orElseGet(() -> {
                User newUser = new User();
                newUser.setEmail(email);
                newUser.setAccountType("GOOGLE");
                userRepository.save(newUser);
                loggingService.info("New user created via Firebase authentication", Map.of(
                        "email", email
                ));
                return newUser;
            });

            String token = JwtUtil.generateToken(user.getEmail(), user.getAccountType(), user.getId());
            loggingService.info("Firebase authentication completed successfully", Map.of(
                    "email", email
            ));
            return Optional.of(token);

        } catch (FirebaseAuthException e) {
            loggingService.error("Firebase authentication failed - token verification error", Map.of(
                    "error", e.getMessage()
            ));
            return Optional.empty();
        }
    }

    // ------------------------- Helper Methods -------------------------
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
 
    //Get authenticated user and if user is not authenticated (guest) returns null
    public User getAuthenticatedUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
                
        if (auth != null && auth.isAuthenticated() && !(auth instanceof AnonymousAuthenticationToken)) {
            User user = new User();
            user.setEmail(auth.getName()); // Get email from security context
            
            // Get account type from authorities
            auth.getAuthorities().stream()
                .findFirst()
                .ifPresent(grantedAuthority -> {
                    String authority = grantedAuthority.getAuthority();
                    String roleName = authority.replace("ROLE_", "");
                    user.setAccountType(roleName);
                });

            // Get userId from authentication details
            if (auth.getDetails() instanceof Map) {
                Map<?, ?> details = (Map<?, ?>) auth.getDetails();
                Object userIdObj = details.get("userId");
                if (userIdObj != null) {
                    user.setId(Integer.parseInt(userIdObj.toString()));
                }
            }
            
            return user;
        }
        
        System.out.println("Returning null - no valid authentication");
        return null; // Guest user
    }

}
