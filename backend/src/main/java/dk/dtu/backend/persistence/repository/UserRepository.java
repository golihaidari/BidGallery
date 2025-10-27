package dk.dtu.backend.persistence.repository;

import dk.dtu.backend.persistence.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Integer> {
    // Custom method to find user by email
    Optional<User> findByEmail(String email); 
}
