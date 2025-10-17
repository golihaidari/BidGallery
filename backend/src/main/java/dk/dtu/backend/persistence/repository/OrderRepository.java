package dk.dtu.backend.persistence.repository;

import dk.dtu.backend.persistence.entity.Order;
import dk.dtu.backend.persistence.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface OrderRepository extends JpaRepository<Order, Integer> {
    List<Order> findByUser(User user); // get orders of a user
}
