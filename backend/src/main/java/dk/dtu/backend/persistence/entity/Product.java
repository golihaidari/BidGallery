package dk.dtu.backend.persistence.entity;

import jakarta.persistence.*;
import java.time.LocalDate;


@Entity
@Table(name = "products")
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Integer id;

    @Column(name = "title", nullable = false)
    private String title;

    @Column(name = "secret_price", nullable = false)
    private double secretPrice;

    @Column(name = "currency", nullable = false)
    private String currency;

    @Column(name = "image_url", nullable = false)
    private String imageUrl;

    @Column(name = "sold", nullable = false)
    private boolean sold = false;

    @ManyToOne
    @JoinColumn(name = "artist_id", nullable = false)
    private Artist artist;

    // New columns
    @Column(name = "description", length = 1024)
    private String description;

    @Column(name = "year_created")
    private Integer yearCreated;

    @Column(name = "product_size")
    private String productSize; // e.g., "120 x 80 cm"

    @Column(name = "date_added")
    private LocalDate dateAdded;

    public Product() {}

    public Product(String title, double secretPrice, String currency, String imageUrl,
                   Artist artist, String description, Integer yearCreated,
                   String productSize, LocalDate dateAdded) {
        this.title = title;
        this.secretPrice = secretPrice;
        this.currency = currency;
        this.imageUrl = imageUrl;
        this.artist = artist;
        this.sold = false;
        this.description = description;
        this.yearCreated = yearCreated;
        this.productSize = productSize;
        this.dateAdded = dateAdded;
    }

    // Getters and Setters
    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public double getSecretPrice() { return secretPrice; }
    public void setSecretPrice(double secretPrice) { this.secretPrice = secretPrice; }

    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }

    public boolean isSold() { return sold; }
    public void setSold(boolean sold) { this.sold = sold; }

    public Artist getArtist() { return artist; }
    public void setArtist(Artist artist) { this.artist = artist; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Integer getYearCreated() { return yearCreated; }
    public void setYearCreated(Integer yearCreated) { this.yearCreated = yearCreated; }

    public String getProductSize() { return productSize; }
    public void setProductSize(String productSize) { this.productSize = productSize; }

    public LocalDate getDateAdded() { return dateAdded; }
    public void setDateAdded(LocalDate dateAdded) { this.dateAdded = dateAdded; }
}
