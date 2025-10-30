package dk.dtu.backend.dto;

import dk.dtu.backend.persistence.entity.Address;
import java.util.List;

public class CheckoutRequest {
    private List<CartItemDTO> cart;
    private Address address;
    private String paymentIntentId;

    public List<CartItemDTO> getCart() { return cart; }
    public void setCart(List<CartItemDTO> cart) { 
        this.cart = cart;
        // Sanitize cart items if present
        if (this.cart != null) {
            this.cart.forEach(this::sanitizeCartItem);
        }
    }

    public Address getAddress() { return address; }
    public void setAddress(Address address) { 
        this.address = address;
        // Sanitize address data if present
        if (this.address != null) {
            sanitizeCheckoutAddress(this.address);
        }
    }

    public String getPaymentIntentId() { return paymentIntentId; }
    public void setPaymentIntentId(String paymentIntentId) { 
        this.paymentIntentId = sanitizePaymentIntent(paymentIntentId);
    }

    // Sanitization methods
    private void sanitizeCartItem(CartItemDTO item) {
        // Cart items are mostly IDs and numbers, but sanitize anyway
        if (item.getBidPrice() != null) {
            // Ensure bid price is positive
            if (item.getBidPrice() < 0) {
                item.setBidPrice(0.0);
            }
        }
    }

    private void sanitizeCheckoutAddress(Address address) {
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

    private String sanitizePaymentIntent(String paymentIntent) {
        if (paymentIntent == null) return null;
        // Remove dangerous characters from payment intent ID
        return paymentIntent.replaceAll("[<>\"';]", "").trim();
    }

    // Shared sanitization methods (same as in RegisterRequest)
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