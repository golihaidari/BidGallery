package dk.dtu.backend.dto;

public class CartItemDTO {
    private Integer productId;
    private Double bidPrice;

    public Integer getProductId() { return productId; }
    public void setProductId(Integer productId) { 
        // Ensure productId is not negative
        this.productId = (productId != null && productId > 0) ? productId : null;
    }

    public Double getBidPrice() { return bidPrice; }
    public void setBidPrice(Double bidPrice) { 
        // Ensure bid price is not negative
        this.bidPrice = (bidPrice != null && bidPrice >= 0) ? bidPrice : 0.0;
    }
}