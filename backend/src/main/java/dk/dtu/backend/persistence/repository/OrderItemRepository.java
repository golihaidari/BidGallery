package dk.dtu.backend.persistence.repository;

import dk.dtu.backend.persistence.entity.OrderItem;
import dk.dtu.backend.persistence.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface OrderItemRepository extends JpaRepository<OrderItem, Integer> {
    
    List<OrderItem> findByOrder(Order order); // items in a specific order
}
