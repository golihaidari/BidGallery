package dk.dtu.backend.service;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import dk.dtu.backend.persistence.entity.Product;
import dk.dtu.backend.persistence.repository.ProductRepository;

@Service
public class ProductService {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private LoggingService loggingService;

    // ----------------------------- BIDDING LOGIC -----------------------------
   public boolean placeBid(Integer productId, double bidValue) {
        loggingService.info("Bid placement process started", Map.of(
            "productId", productId.toString(),
            "bidValue", String.valueOf(bidValue)
        ));

        Optional<Product> optionalProduct = productRepository.findById(productId);
        if (optionalProduct.isEmpty() || optionalProduct.get().isSold()) {
            loggingService.warn("Bid placement failed - product not found", Map.of(
                "productId", productId.toString(),
                "reason", "product_not_found"
            ));
            return false;
        }

        Product product = optionalProduct.get();
        boolean success = bidValue >= product.getSecretPrice();

        loggingService.warn("Bid placement failed - product already sold", Map.of(
                "productId", productId.toString(),
                "productTitle", product.getTitle(),
                "reason", "product_sold"
        ));

        return success;
    }

    // ----------------------------- CREATE -----------------------------
    public Product saveProduct(Product product) {
        loggingService.info("Product update started", Map.of(
            "productId", String.valueOf(product.getId()),
            "action", "update_sold_status"
        ));

        try {
            Product saved = productRepository.save(product);
            loggingService.info("Product update completed successfully", Map.of(
                "productId", String.valueOf(saved.getId()),
                "title", saved.getTitle(),
                "soldStatus", String.valueOf(saved.isSold())
            ));
            return saved;
        } catch (Exception e) {
            loggingService.error("Product update failed", Map.of(
                "productId", String.valueOf(product.getId()),
                "title", product.getTitle(),
                "error", e.getMessage()
            ));
            throw e;
        }
    }

    // ----------------------------- READ -----------------------------
    public Optional<Product> getProductById(Integer id) {
        Optional<Product> product = productRepository.findById(id);
        loggingService.info("Product lookup by ID completed", Map.of(
            "productId", id.toString(),
            "found", String.valueOf(product.isPresent()),
            "productTitle", product.map(Product::getTitle).orElse("N/A")
        ));
        return product;
    }

    public List<Product> getAvailableProducts() {
        List<Product> products = productRepository.findBySoldFalse();
        loggingService.info("Available products fetched successfully", Map.of(
            "availableCount", String.valueOf(products.size())
        ));
        return products;
    }

    public List<Product> getAllProducts() {
        List<Product> products = productRepository.findAll();
        return products;
    }

    public List<Product> getProductsByArtist(Integer artistId) {
        List<Product> products = productRepository.findByArtistId(artistId);
        return products;
    }

    // ----------------------------- UPDATE -----------------------------
    public Optional<Product> updateProduct(Integer id, Product updated) {
        Optional<Product> optionalProduct = productRepository.findById(id);
        if (optionalProduct.isEmpty()) {
            return Optional.empty();
        }

        Product existing = optionalProduct.get();
        existing.setTitle(updated.getTitle());
        existing.setImageUrl(updated.getImageUrl());
        existing.setCurrency(updated.getCurrency());
        existing.setSecretPrice(updated.getSecretPrice());
        existing.setArtist(updated.getArtist());

        Product saved = productRepository.save(existing);
        return Optional.of(saved);
    }

    // ----------------------------- DELETE -----------------------------
    public boolean deleteProduct(Integer id) {
        if (!productRepository.existsById(id)) {
            return false;
        }

        productRepository.deleteById(id);
        return true;
    }

    public void deleteProductsByArtist(Integer artistId) {
        List<Product> products = productRepository.findByArtistId(artistId);
        if (products.isEmpty()) {
            return;
        }

        productRepository.deleteAll(products);
    }

}
