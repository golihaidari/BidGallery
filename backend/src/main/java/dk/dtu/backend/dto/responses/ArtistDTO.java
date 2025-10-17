package dk.dtu.backend.dto.responses;

public class ArtistDTO {
    private int id;        
    private String firstName;
    private String lastName;
    private String bio;
    private String style;
    private String imageUrl;

    public ArtistDTO(){}
    // Constructor
    public ArtistDTO(int id, String firstName, String lastName, String bio, String style, String imageUrl) {
        this.id = id;
        this.firstName = firstName;
        this.lastName = lastName;
        this.bio = bio;
        this.style = style;
        this.imageUrl = imageUrl;
    }

    // Getters & Setters
    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

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
