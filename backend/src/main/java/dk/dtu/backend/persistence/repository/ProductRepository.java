package dk.dtu.backend.persistence.repository;

import dk.dtu.backend.persistence.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ProductRepository extends JpaRepository<Product, Integer> {
    // Find products that are not sold yet
    List<Product> findBySoldFalse();

    // Find products by artist id
    List<Product> findByArtistId(Integer artistId);
}
