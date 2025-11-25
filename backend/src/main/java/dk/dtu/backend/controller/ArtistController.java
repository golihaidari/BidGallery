package dk.dtu.backend.controller;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import dk.dtu.backend.dto.responses.ArtistDTO;
import dk.dtu.backend.persistence.entity.Artist;
import dk.dtu.backend.service.ArtistService;
import dk.dtu.backend.service.MetricService;
import dk.dtu.backend.utils.DtoMapper;
import jakarta.servlet.http.HttpServletRequest;

@RestController
@RequestMapping("/api/artists")
public class ArtistController {

    @Autowired
    private ArtistService artistService;

    @Autowired
    private MetricService metricService;

    // ------------------- READ ------------------------------
    // Get all artists 
    @GetMapping
    public ResponseEntity<List<ArtistDTO>> getAllArtists(HttpServletRequest httpRequest) {

        String correlationId = (String) httpRequest.getAttribute("correlationId"); 

        long startTime = System.currentTimeMillis();

        List<Artist> artists = artistService.getAllArtists();

        // Map Product entities to ProductDTO
        List<ArtistDTO> artistDTOs = DtoMapper.toArtistDTOList(artists);

        long duration = System.currentTimeMillis() - startTime;
        metricService.incrementCounter("artists.all.fetch", 
        "success", "true",
            "correlationId", correlationId);
        metricService.recordDuration("artists.all.duration", duration, 
        "success", "true",
            "correlationId", correlationId);

        return ResponseEntity.ok(artistDTOs);
    }

    // Get Single Artist 
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'ARTIST')")
    public ResponseEntity<?> getArtist(@PathVariable Integer id) {
        Optional<Artist> artistOpt = artistService.getArtistById(id);
        if (artistOpt.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of("error", "Artist not found with id " + id));
        }
        return ResponseEntity.ok(Map.of("message", "Artist found", "artist", artistOpt.get()));
    }

    // ------------------- Update------------------------------
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'ARTIST')")
    public ResponseEntity<?> updateArtist(@PathVariable Integer id, @RequestBody Artist updated) {

        Optional<Artist> artistOpt = artistService.updateArtist(id, updated);
        if (artistOpt.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of("error", "Artist not found with id " + id));
        }
        return ResponseEntity.ok(Map.of("message", "Artist updated", "artist", artistOpt.get()));
    }

    // ------------------- DELETE------------------------------
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'ARTIST')")
    public ResponseEntity<?> deleteArtist(@PathVariable Integer id) {
        Optional<Artist> artistOpt = artistService.getArtistById(id);
        if (artistOpt.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of("error", "Artist not found with id " + id));
        }

        // Service method deletes artist and all related products
        artistService.deleteArtistAndProducts(id);

        return ResponseEntity.ok(Map.of(
            "message", "Artist and related products deleted successfully",
            "artistId", id
        ));
    }
}
