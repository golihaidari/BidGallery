package dk.dtu.backend.service;

import dk.dtu.backend.persistence.entity.User;
import dk.dtu.backend.persistence.repository.UserRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private LoggingService loggingService;

    // ----------------------------- CREATE -----------------------------
    public boolean saveUser(User user) {
        try {
            userRepository.save(user);
            loggingService.info("User saved successfully", Map.of(
                "email", user.getEmail(),
                "action", "create"
            ));
            return true;
        } catch (Exception e) {
            loggingService.error("Error saving user", Map.of(
                "email", user.getEmail(),
                "error", e.getMessage()
            ));
            return false;
        }
    }

    // ----------------------------- READ -----------------------------
    public Optional<User> getUserById(Integer id) {
        Optional<User> userOpt = userRepository.findById(id);
        loggingService.info("Fetched user by ID", Map.of(
            "userId", id.toString(),
            "found", String.valueOf(userOpt.isPresent())
        ));
        return userOpt;
    }

    public Optional<User> getUserByEmail(String email) {
        Optional<User> userOpt = userRepository.findByEmail(email);
        loggingService.info("Fetched user by email", Map.of(
            "email", email,
            "found", String.valueOf(userOpt.isPresent())
        ));
        return userOpt;
    }

    public List<User> getAllUsers() {
        List<User> users = userRepository.findAll();
        loggingService.info("Fetched all users", Map.of(
            "count", String.valueOf(users.size())
        ));
        return users;
    }

    // ----------------------------- UPDATE -----------------------------
    public Optional<User> updateUser(String email, User updatedUser) {
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) {
            loggingService.warn("Attempted to update non-existing user", Map.of("email", email));
            return Optional.empty();
        }

        User existingUser = userOpt.get();
        if (updatedUser.getPassword() != null && !updatedUser.getPassword().isBlank()) {
            existingUser.setPassword(updatedUser.getPassword());
        }
        if (updatedUser.getAccountType() != null) {
            existingUser.setAccountType(updatedUser.getAccountType());
        }

        User savedUser = userRepository.save(existingUser);
        loggingService.info("User updated successfully", Map.of(
            "email", email,
            "action", "update"
        ));

        return Optional.of(savedUser);
    }

    // ----------------------------- DELETE -----------------------------
    public boolean deleteUser(String email) {
        Optional<User> userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) {
            loggingService.warn("Attempted to delete non-existing user", Map.of("email", email));
            return false;
        }

        userRepository.delete(userOpt.get());
        loggingService.info("User deleted successfully", Map.of(
            "email", email,
            "action", "delete"
        ));
        return true;
    }
}
