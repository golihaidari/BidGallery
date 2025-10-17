package dk.dtu.backend.dto;

public class CartItemDTO {
    private Integer productId;
    private Double bidPrice;

    public Integer getProductId() { return productId; }
    public void setProductId(int productId) { this.productId = productId; }

    public Double getBidPrice() { return bidPrice; }
    public void setBidPrice(double bidPrice) { this.bidPrice = bidPrice; }
}