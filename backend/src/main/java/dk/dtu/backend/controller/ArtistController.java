package dk.dtu.backend.controller;

import dk.dtu.backend.persistence.entity.Artist;
import dk.dtu.backend.dto.responses.ArtistDTO;
import dk.dtu.backend.persistence.entity.AccountType;
import dk.dtu.backend.security.Protected;
import dk.dtu.backend.security.RoleProtected;
import dk.dtu.backend.service.ArtistService;
import dk.dtu.backend.utils.DtoMapper;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/artists")
public class ArtistController {

    @Autowired
    private ArtistService artistService;

    // ------------------- READ ------------------------------
    // Get all artists 
    @GetMapping
    @Protected
    @RoleProtected(roles = {AccountType.ADMIN, AccountType.CUSTOMER})
    public ResponseEntity<List<ArtistDTO>> getAllArtists() {
        List<Artist> artists = artistService.getAllArtists();
        return ResponseEntity.ok(DtoMapper.toArtistDTOList(artists));
    }

    // Get Single Artist 
    @GetMapping("/{id}")
    @Protected
    @RoleProtected(roles = {AccountType.ADMIN, AccountType.ARTIST})
    public ResponseEntity<?> getArtist(@PathVariable Integer id) {
        Optional<Artist> artistOpt = artistService.getArtistById(id);
        if (artistOpt.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of("error", "Artist not found with id " + id));
        }
        return ResponseEntity.ok(Map.of("message", "Artist found", "artist", artistOpt.get()));
    }

    // ------------------- Update------------------------------
    @PutMapping("/{id}")
    @Protected
    @RoleProtected(roles = {AccountType.ARTIST})
    public ResponseEntity<?> updateArtist(@PathVariable Integer id, @RequestBody Artist updated) {

        Optional<Artist> artistOpt = artistService.updateArtist(id, updated);
        if (artistOpt.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of("error", "Artist not found with id " + id));
        }
        return ResponseEntity.ok(Map.of("message", "Artist updated", "artist", artistOpt.get()));
    }

    // ------------------- DELETE------------------------------
    @DeleteMapping("/{id}")
    @Protected
    @RoleProtected(roles = {AccountType.ADMIN, AccountType.ARTIST})
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
