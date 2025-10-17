package dk.dtu.backend.persistence.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "artists")
public class Artist {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Integer id;  // simple id

    @OneToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "first_name", nullable = false)
    private String firstName;

    @Column(name = "last_name", nullable = false)
    private String lastName;

    @Column(name = "bio", nullable = true)
    private String bio;

    @Column(name = "style", nullable = true)
    private String style;

     @Column(name = "image_url", nullable = true)
    private String imageUrl;

    public Artist() {}

    public Artist(User user, String firstName, String lastName, String bio, String style, String imageUrl) {
        this.user = user;
        this.firstName = firstName;
        this.lastName = lastName;
        this.bio = bio;
        this.style = style;
        this.imageUrl = imageUrl;
    }

    // Getters and Setters
    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }

    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }

    public String getBio() { return bio; }
    public void setBio(String bio) { this.bio = bio; }

    public String getStyle() { return style; }
    public void setStyle(String style) { this.style = style; }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
}
