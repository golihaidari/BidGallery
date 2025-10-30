package dk.dtu.backend.service;

import dk.dtu.backend.persistence.entity.Artist;
import dk.dtu.backend.persistence.entity.User;
import dk.dtu.backend.persistence.repository.ArtistRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class ArtistService {

    @Autowired
    private ArtistRepository artistRepository;

    @Autowired
    private ProductService productService;

    @Autowired
    private LoggingService loggingService;

    // ------------------ CREATE -----------------------
    public Artist saveArtist(Artist artist) {
        try {
            Artist saved = artistRepository.save(artist);
            loggingService.info("Artist saved successfully", Map.of(
                "artistId", String.valueOf(saved.getId()),
                "userId", artist.getUser() != null ? String.valueOf(artist.getUser().getId()) : "null",
                "action", "create"
            ));
            return saved;
        } catch (Exception e) {
            loggingService.error("Error saving artist", Map.of(
                "artistName", artist.getFirstName() + " " + artist.getLastName(),
                "error", e.getMessage()
            ));
            throw e;
        }
    }

    // ------------------ READ -----------------------
    public List<Artist> getAllArtists(String requestId) {
        List<Artist> artists = artistRepository.findAll();
        loggingService.info("All artists response prepared", Map.of(
            "count", String.valueOf(artists.size()),
            "requestId", requestId         
        ));
        return artists;
    }

    public Optional<Artist> getArtistById(Integer id) {
        Optional<Artist> artistOpt = artistRepository.findById(id);
        return artistOpt;
    }

    public Optional<Artist> getArtistByUser(User user) {
        Optional<Artist> artistOpt = artistRepository.findByUser(user);
        return artistOpt;
    }
    // ------------------ UPDATE -----------------------
    public Optional<Artist> updateArtist(Integer id, Artist updatedArtist) {
        Optional<Artist> artistOpt = artistRepository.findById(id);
        if (artistOpt.isEmpty()) {
            return Optional.empty();
        }

        Artist artist = artistOpt.get();
        artist.setFirstName(updatedArtist.getFirstName());
        artist.setLastName(updatedArtist.getLastName());
        artist.setBio(updatedArtist.getBio());
        artist.setStyle(updatedArtist.getStyle());

        Artist saved = artistRepository.save(artist);
        return Optional.of(saved);
    }

    // ------------------ DELETE -----------------------
    public boolean deleteArtist(Integer id) {
        if (!artistRepository.existsById(id)) {
            return false;
        }

        artistRepository.deleteById(id);
        return true;
    }

    // ------------------ DELETE (with related products) -----------------------
    @Transactional
    public void deleteArtistAndProducts(Integer artistId) {
        try {
            productService.deleteProductsByArtist(artistId);
            artistRepository.deleteById(artistId);
        } catch (Exception e) {
            throw e;
        }
    }
}
