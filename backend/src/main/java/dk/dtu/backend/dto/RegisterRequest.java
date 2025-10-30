package dk.dtu.backend.dto;

import jakarta.validation.constraints.*;
import dk.dtu.backend.persistence.entity.User;
import dk.dtu.backend.persistence.entity.Artist;
import dk.dtu.backend.persistence.entity.Address;

public class RegisterRequest {
    
    @NotNull(message = "User data is required")
    private User user;
    private Artist artist;    // optional
    private Address address;  // optional

    // Getters & setters with sanitization
    public User getUser() { return user; }
    public void setUser(User user) { 
        this.user = user;
        // Sanitize user data if present
        if (this.user != null) {
            sanitizeUser(this.user);
        }
    }

    public Artist getArtist() { return artist; }
    public void setArtist(Artist artist) { 
        this.artist = artist;
        // Sanitize artist data if present
        if (this.artist != null) {
            sanitizeArtist(this.artist);
        }
    }

    public Address getAddress() { return address; }
    public void setAddress(Address address) { 
        this.address = address;
        // Sanitize address data if present
        if (this.address != null) {
            sanitizeAddress(this.address);
        }
    }

    // Sanitization methods
    private void sanitizeUser(User user) {
        if (user.getEmail() != null) {
            user.setEmail(sanitizeEmail(user.getEmail()));
        }
        // Add other user field sanitizations as needed
    }

    private void sanitizeArtist(Artist artist) {
        if (artist.getFirstName() != null) {
            artist.setFirstName(sanitizeText(artist.getFirstName()));
        }
        if (artist.getLastName() != null) {
            artist.setLastName(sanitizeText(artist.getLastName()));
        }
        if (artist.getBio() != null) {
            artist.setBio(sanitizeText(artist.getBio()));
        }
        if (artist.getStyle() != null) {
            artist.setStyle(sanitizeText(artist.getStyle()));
        }
    }

    private void sanitizeAddress(Address address) {
        if (address.getFirstName() != null) {
            address.setFirstName(sanitizeName(address.getFirstName()));
        }
        if (address.getLastName() != null) {
            address.setLastName(sanitizeName(address.getLastName()));
        }
        if (address.getEmail() != null) {
            address.setEmail(sanitizeEmail(address.getEmail()));
        }
        if (address.getMobileNr() != null) {
            address.setMobileNr(sanitizePhoneNumber(address.getMobileNr()));
        }
        if (address.getCountry() != null) {
            address.setCountry(sanitizeText(address.getCountry()));
        }
        if (address.getPostalCode() != null) {
            address.setPostalCode(sanitizePostalCode(address.getPostalCode()));
        }
        if (address.getCity() != null) {
            address.setCity(sanitizeText(address.getCity()));
        }
        if (address.getAddress1() != null) {
            address.setAddress1(sanitizeAddressField(address.getAddress1()));
        }
        if (address.getAddress2() != null) {
            address.setAddress2(sanitizeAddressField(address.getAddress2()));
        }
    }

    // Shared sanitization methods
    private String sanitizeName(String input) {
        if (input == null) return null;
        return input.replaceAll("[^a-zA-ZæøåÆØÅ\\s-]", "").trim();
    }

    private String sanitizeText(String input) {
        if (input == null) return null;
        return input.replaceAll("[<>\"';]", "").trim();
    }

    private String sanitizeAddressField(String input) {
        if (input == null) return null;
        return input.replaceAll("[<>\"';]", "").trim();
    }

    private String sanitizeEmail(String email) {
        if (email == null) return null;
        return email.toLowerCase().trim().replaceAll("[<>\"';]", "");
    }

    private String sanitizePhoneNumber(String phone) {
        if (phone == null || phone.trim().isEmpty()) return null;
        String cleaned = phone.replaceAll("[^0-9+]", "");
        if (cleaned.startsWith("+")) {
            return "+" + cleaned.substring(1).replaceAll("[^0-9]", "");
        }
        return cleaned.replaceAll("[^0-9]", "");
    }

    private String sanitizePostalCode(String postalCode) {
        if (postalCode == null) return null;
        return postalCode.replaceAll("[^0-9]", "").trim();
    }
}