package dk.dtu.backend.service;

import dk.dtu.backend.persistence.entity.Product;
import dk.dtu.backend.persistence.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class ProductService {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private LoggingService loggingService;

    // ----------------------------- CREATE -----------------------------
    public Product saveProduct(Product product, String userEmail, String requestId) {
        Map<String, String> mdc = Map.of(
            "userEmail", userEmail != null ? userEmail : "guest",
            "requestId", requestId
        );

        try {
            Product saved = productRepository.save(product);
            loggingService.info("Product saved successfully", mergeMaps(mdc, Map.of(
                "productId", String.valueOf(saved.getId()),
                "title", saved.getTitle(),
                "artistId", saved.getArtist() != null ? String.valueOf(saved.getArtist().getId()) : "null",
                "action", "save"
            )));
            return saved;
        } catch (Exception e) {
            loggingService.error("Error saving product", mergeMaps(mdc, Map.of(
                "title", product.getTitle(),
                "error", e.getMessage()
            )));
            throw e;
        }
    }

    // ----------------------------- READ -----------------------------
    public Optional<Product> getProductById(Integer id) {
        Optional<Product> product = productRepository.findById(id);
        loggingService.info("Fetched product by ID", Map.of(
            "productId", id.toString(),
            "found", String.valueOf(product.isPresent())
        ));
        return product;
    }

    public List<Product> getAllProducts() {
        List<Product> products = productRepository.findAll();
        loggingService.info("Fetched all products", Map.of(
            "count", String.valueOf(products.size())
        ));
        return products;
    }

    public List<Product> getAvailableProducts() {
        List<Product> products = productRepository.findBySoldFalse();
        loggingService.info("Fetched available products", Map.of(
            "count", String.valueOf(products.size())
        ));
        return products;
    }

    public List<Product> getProductsByArtist(Integer artistId) {
        List<Product> products = productRepository.findByArtistId(artistId);
        loggingService.info("Fetched products by artist", Map.of(
            "artistId", artistId.toString(),
            "count", String.valueOf(products.size())
        ));
        return products;
    }

    // ----------------------------- UPDATE -----------------------------
    public Optional<Product> updateProduct(Integer id, Product updated) {
        Optional<Product> optionalProduct = productRepository.findById(id);
        if (optionalProduct.isEmpty()) {
            loggingService.warn("Attempted to update non-existing product", Map.of(
                "productId", id.toString()
            ));
            return Optional.empty();
        }

        Product existing = optionalProduct.get();
        existing.setTitle(updated.getTitle());
        existing.setImageUrl(updated.getImageUrl());
        existing.setCurrency(updated.getCurrency());
        existing.setSecretPrice(updated.getSecretPrice());
        existing.setArtist(updated.getArtist());

        Product saved = productRepository.save(existing);
        loggingService.info("Product updated successfully", Map.of(
            "productId", String.valueOf(saved.getId()),
            "title", saved.getTitle(),
            "action", "update"
        ));
        return Optional.of(saved);
    }

    // ----------------------------- DELETE -----------------------------
    public boolean deleteProduct(Integer id) {
        if (!productRepository.existsById(id)) {
            loggingService.warn("Attempted to delete non-existing product", Map.of(
                "productId", id.toString()
            ));
            return false;
        }

        productRepository.deleteById(id);
        loggingService.info("Product deleted successfully", Map.of(
            "productId", id.toString(),
            "action", "delete"
        ));
        return true;
    }

    public void deleteProductsByArtist(Integer artistId) {
        List<Product> products = productRepository.findByArtistId(artistId);
        if (products.isEmpty()) {
            loggingService.warn("No products found for artist deletion", Map.of(
                "artistId", artistId.toString()
            ));
            return;
        }

        productRepository.deleteAll(products);
        loggingService.info("Deleted all products for artist", Map.of(
            "artistId", artistId.toString(),
            "deletedCount", String.valueOf(products.size())
        ));
    }

    // ----------------------------- BIDDING LOGIC -----------------------------
   public boolean placeBid(Integer productId, double bidValue, String userEmail, String requestId) {
        Map<String, String> mdc = Map.of(
            "userEmail", userEmail != null ? userEmail : "guest",
            "requestId", requestId
        );

        Optional<Product> optionalProduct = productRepository.findById(productId);
        if (optionalProduct.isEmpty() || optionalProduct.get().isSold()) {
            loggingService.warn("Bid failed. Product not found or already sold", mergeMaps(mdc, Map.of(
                "productId", productId.toString(),
                "bidValue", String.valueOf(bidValue)
            )));
            return false;
        }

        Product product = optionalProduct.get();
        boolean success = bidValue >= product.getSecretPrice();

        loggingService.info("Bid attempt processed", mergeMaps(mdc, Map.of(
            "productId", productId.toString(),
            "bidValue", String.valueOf(bidValue),
            "secretPrice", String.valueOf(product.getSecretPrice()),
            "success", String.valueOf(success)
        )));

        return success;
    }

    // Helper method to merge maps (if not already in ProductService)
    private Map<String, String> mergeMaps(Map<String, String> a, Map<String, String> b) {
        Map<String, String> merged = new HashMap<>(a);
        merged.putAll(b);
        return merged;
    }

}
