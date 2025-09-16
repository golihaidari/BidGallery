import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import type { ProductItem } from "../interfaces/ProductItem";
import "./Bid.css";

const Bid: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const product: ProductItem = location.state?.product;

  const [bidAmount, setBidAmount] = useState<number>(0);
  const [error, setError] = useState("");

  if (!product) return <h1>No product selected</h1>;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (bidAmount > product.price) {
      // Bid accepted, navigate to Payment page
      navigate("/payment", { state: { product, bidAmount } });
    } else {
      setError(`Your bid is too LOW! Retry again.`);
    }
  };

  return (
    <div className="BidPage">
      <h1>Place your bid for: {product.title}</h1>
      <img src={product.image} alt={product.title} />
      <p>Original price: {product.price.toFixed(2)} {product.currency}</p>

      <form onSubmit={handleSubmit}>
        <input
          type="number"
          placeholder="Enter your bid"
          value={bidAmount}
          onChange={(e) => setBidAmount(Number(e.target.value))}
          min={product.price + 0.01}
          step="0.01"
          required
        />
        <button type="submit">Submit Bid</button>
      </form>

      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
};

export default Bid;
