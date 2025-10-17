package dk.dtu.backend.persistence.repository;

import dk.dtu.backend.persistence.entity.Address;
import dk.dtu.backend.persistence.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface AddressRepository extends JpaRepository<Address, Integer> {
    
    // Get all addresses of a specific user
    List<Address> findByUser(User user);

    // Used for logged-in users
    Optional<Address> findByUserAndAddress1AndCityAndPostalCode(User user, String address1, String city, String postalCode);

    // ✅ Used for guests (no user)
    Optional<Address> findByAddress1AndCityAndPostalCode(String address1, String city, String postalCode);
}
