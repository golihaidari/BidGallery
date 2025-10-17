package dk.dtu.backend.persistence.repository;

import dk.dtu.backend.persistence.entity.Artist;
import dk.dtu.backend.persistence.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface ArtistRepository extends JpaRepository<Artist, Integer> {
    
    List<Artist> findByStyle(String style); // optional: search by style
     
    Optional<Artist> findByUser(User user); // Custom method to find artist by user
}
