package dk.dtu.backend.dto;

import dk.dtu.backend.persistence.entity.Address;
import java.util.List;

public class CheckoutRequest {
    private List<CartItemDTO> cart;
    private Address address;
    private String paymentIntentId; // mock payment token

    public List<CartItemDTO> getCart() { return cart; }
    public void setCart(List<CartItemDTO> cart) { this.cart = cart; }

    public Address getAddress() { return address; }
    public void setAddress(Address address) { this.address = address; }

    public String getPaymentIntentId() { return paymentIntentId; }
    public void setPaymentIntentId(String paymentIntentId) { this.paymentIntentId = paymentIntentId; }
}


