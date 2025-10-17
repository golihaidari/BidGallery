package dk.dtu.backend.utils;

import dk.dtu.backend.dto.responses.ProductDTO;
import dk.dtu.backend.dto.responses.ArtistDTO;
import dk.dtu.backend.persistence.entity.Product;
import dk.dtu.backend.persistence.entity.Artist;

import java.util.List;
import java.util.stream.Collectors;

public class DtoMapper {

    // -------------------- PRODUCT --------------------
    public static ProductDTO toProductDTO(Product product) {
        ProductDTO dto = new ProductDTO();
        dto.setId(product.getId());
        dto.setTitle(product.getTitle());
        dto.setImageUrl(product.getImageUrl());
        dto.setSecretPrice(product.getSecretPrice());
        dto.setCurrency(product.getCurrency());
        dto.setDescription(product.getDescription());
        dto.setYearCreated(product.getYearCreated().toString());
        dto.setProductSize(product.getProductSize());
        dto.setDateAdded(product.getDateAdded().toString());

        // Flatten artist info
        if (product.getArtist() != null) {
            dto.setArtistFirstName(product.getArtist().getFirstName());
            dto.setArtistLastName(product.getArtist().getLastName());
            dto.setStyle(product.getArtist().getStyle());
        }

        return dto;
    }

    public static List<ProductDTO> toProductDTOList(List<Product> products) {
        return products.stream()
                .map(DtoMapper::toProductDTO)
                .collect(Collectors.toList());
    }

    // -------------------- ARTIST --------------------
    public static ArtistDTO toArtistDTO(Artist artist) {
        ArtistDTO dto = new ArtistDTO();
        dto.setId(artist.getId());
        dto.setFirstName(artist.getFirstName());
        dto.setLastName(artist.getLastName());
        dto.setBio(artist.getBio());
        dto.setStyle(artist.getStyle());
        dto.setImageUrl(artist.getImageUrl());
        return dto;
    }

    public static List<ArtistDTO> toArtistDTOList(List<Artist> artists) {
        return artists.stream()
                .map(DtoMapper::toArtistDTO)
                .collect(Collectors.toList());
    }
}
