import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import "./Bid.css";
import { BidContext } from "../context/BidContext";
import useFetch from "../hook/fetchData";

const Bid: React.FC = () => {
  const bidContext = useContext(BidContext);
  const navigate = useNavigate();

  if(!bidContext) {
      return <h1>"BidContext not available. wrap in BidProvider."</h1>;
  }

  const { bid, setBid} = bidContext;
  const [bidAmount, setBidAmount] = useState<number>(0);
  const [error, setError] = useState("");

  const { sendRequest, data, isLoading, error: fetchError } = useFetch<{
    accepted : boolean;
    bidSessionId?: string;
    paymentClientSecret?: string;
    message?: string;
  }>("URL?");

  const product = bid.product;
  if (!product) return <h1>No product selected</h1>;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    sendRequest(
      {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body : JSON.stringify({
          productId: bid.product?.id,
          amount: bidAmount,
        }),
      },
      "Failed to submit bid"
    );
  };

  //React when data changes (success cases)
  React.useEffect(() => {
    if(data) {
      if(!data.accepted) {
        setError(data.message || "Your bid is too LOW! Retry again.");
        return;
      }

      setBid({
        ...bid,
        bidAmount: bidAmount,
        bidSession_id: data.bidSessionId,
        paymentClientSecret: data.paymentClientSecret,
      });

      navigate("/payment");
    }
  },[data]);

  return (
    <div className="BidPage">
      <h1>Place your bid for: {bid.product?.title}</h1>
      <img src={bid.product?.image} alt={bid.product?.title} />
      <p>Original price: {bid.product?.price.toFixed(2)} {bid.product?.currency}</p>

      <form onSubmit={handleSubmit}>
        <input
          type="number"
          placeholder="Enter your bid"
          value={bidAmount}
          onChange={(e) => setBidAmount(Number(e.target.value))}
          min={bid.product!.price + 0.01}
          step="0.01"
          required
        />
        <button type="submit" disabled={isLoading}>
          {isLoading ? "..." :"Submit Bid"} 
        </button>
      </form>

      {error && <p style={{ color: "red" }}>{error}</p>}
      {fetchError && <p style={{ color: "red" }}>{fetchError}</p>}
    </div>
  );
};

export default Bid;
