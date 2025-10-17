package dk.dtu.backend.dto;

import dk.dtu.backend.persistence.entity.User;
import dk.dtu.backend.persistence.entity.Artist;
import dk.dtu.backend.persistence.entity.Address;

public class RegisterRequest {
    private User user;
    private Artist artist;    // optional
    private Address address;  // optional

    // Getters & setters
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public Artist getArtist() { return artist; }
    public void setArtist(Artist artist) { this.artist = artist; }

    public Address getAddress() { return address; }
    public void setAddress(Address address) { this.address = address; }
}
