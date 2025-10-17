package dk.dtu.backend.dto.responses;

public class ProductDTO {
    private int id;
    private String title;
    private String imageUrl;
    private double secretPrice;
    private String currency;
    private String description;
    private String yearCreated;
    private String productSize;
    private String dateAdded;
    private String artistFirstName;
    private String artistLastName;
    private String style;

    // --- getters & setters ---
    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }

    public double getSecretPrice() { return secretPrice; }
    public void setSecretPrice(double secretPrice) { this.secretPrice = secretPrice; }

    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }
    
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description;}

    public String getYearCreated() { return yearCreated; }
    public void setYearCreated(String yearCreated) { this.yearCreated = yearCreated; }
    
    public String getProductSize() { return productSize; }
    public void setProductSize(String productSize) { this.productSize = productSize; }

    public String getDateAdded() { return dateAdded; }
    public void setDateAdded(String dateAdded) { this.dateAdded = dateAdded; }

    public String getArtistFirstName() { return artistFirstName; }
    public void setArtistFirstName(String artistFirstName) { this.artistFirstName = artistFirstName; }

    public String getArtistLastName() { return artistLastName; }
    public void setArtistLastName(String artistLastName) { this.artistLastName = artistLastName; }

    public String getStyle() { return style; }
    public void setStyle(String style) { this.style = style; }
}
