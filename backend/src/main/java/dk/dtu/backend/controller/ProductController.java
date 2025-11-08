package dk.dtu.backend.controller;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import dk.dtu.backend.dto.responses.ProductDTO;
import dk.dtu.backend.persistence.entity.Product;
import dk.dtu.backend.service.MetricService;
import dk.dtu.backend.service.ProductService;
import dk.dtu.backend.utils.DtoMapper;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    @Autowired
    private ProductService productService;

    @Autowired
    private MetricService metricService;

    // ----------------------------CREATE ------------------------------
    @PostMapping
    @PreAuthorize("hasRole('ARTIST')")
    public ResponseEntity<?> createProduct(
            @RequestBody Product product,
            @RequestHeader(value = "X-User-Email", required = false) String userEmail,
            @RequestHeader(value = "X-Request-Id", required = false) String requestId
    ) {

        // Validate required fields
        if (product.getTitle() == null || product.getTitle().isBlank() ||
            product.getArtist() == null || product.getArtist().getId() == null ||
            product.getSecretPrice() <= 0 
        ) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Product fields are required"));
        }

        // Save product via service, which now handles logging
        Product saved = productService.saveProduct(product);

        if (saved == null) {
            return ResponseEntity.status(500)
                    .body(Map.of("error", "Product could not be created"));
        }

        return ResponseEntity.ok(Map.of(
                "message", "Product created",
                "product", saved
        ));
    }


    // ----------------------------READ------------------------------
   // Get all products
    @GetMapping
    public ResponseEntity<List<ProductDTO>> getAllProductDTOs() {
        List<Product> products = productService.getAllProducts();

        // Map Product entities to ProductDTO
        List<ProductDTO> productDTOs = DtoMapper.toProductDTOList(products);

        return ResponseEntity.ok(productDTOs);
    }

    // Get available products
    @GetMapping("/available")
    public ResponseEntity<List<ProductDTO>> getAvailableProducts() {
        long startTime = System.currentTimeMillis();

        //User user = authService.getAuthenticatedUser();
        List<Product> products = productService.getAvailableProducts(); 

        // Map Product entities to ProductDTO
        List<ProductDTO> productDTOs = DtoMapper.toProductDTOList(products);

        long duration = System.currentTimeMillis() - startTime;
        metricService.incrementCounter("products.available.fetch", "success", "true");
        metricService.recordDuration("products.available.duration", duration, "success", "true");

        return ResponseEntity.ok(productDTOs);
    }

    // Get products by artist
    @GetMapping("/artist/{artistId}")
    public ResponseEntity<?> getProductsByArtist(@PathVariable Integer artistId) {
        List<Product> products = productService.getProductsByArtist(artistId);
        if (products.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of("message", "No products found for this artist"));
        } 

        return ResponseEntity.ok(Map.of("message", "Artist products", "products", products));
    }

    // Get product by ID
    @GetMapping("/{id}")
    public ResponseEntity<?> getProduct(@PathVariable Integer id) {
        Product product = productService.getProductById(id).orElse(null);
        if (product == null) {
            return ResponseEntity.status(404).body(Map.of("error", "Product not found with id " + id));
        } 
        
        return ResponseEntity.ok(Map.of("message", "Product found", "product", product));
    }

    // ----------------------------UPDATE------------------------------
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'ARTIST')")
    public ResponseEntity<?> updateProduct(@PathVariable Integer id, @RequestBody Product updatedProduct) {

        // Validate required fields
        if (updatedProduct.getTitle() == null || updatedProduct.getTitle().isBlank()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Product title is required"));
        }
        if ( updatedProduct.getSecretPrice() <= 0) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Secret price must be greater than 0"));
        }
        if (updatedProduct.getCurrency() == null || updatedProduct.getCurrency().isBlank()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Currency is required"));
        }

        Product updated = productService.updateProduct(id, updatedProduct).orElse(null);

        if (updated == null) {
            return ResponseEntity.status(404).body(Map.of("error", "Product not found with id " + id));
        } 
        
        return ResponseEntity.ok(Map.of("message", "Product updated", "product", updated));
    }

    // ----------------------------DELETE------------------------------
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'ARTIST')")
    public ResponseEntity<?> deleteProduct(@PathVariable Integer id) {
        if (productService.deleteProduct(id)) {
            return ResponseEntity.ok(Map.of("message", "Product deleted"));
        } 
        
        return ResponseEntity.status(404).body(Map.of("error", "Product not found with id " + id));
    }

}
