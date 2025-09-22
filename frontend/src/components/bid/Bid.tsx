import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Typography, TextField, Button, Card, CardContent } from "@mui/material";
import "./Bid.css";
import useFetch from "@hook/fetchData";
import { useCheckout } from "@context/CheckoutContext";

const Bid: React.FC = () => {
  const { state, dispatch } = useCheckout();
  const navigate = useNavigate();

  const [bidAmount, setBidAmount] = useState<number>(0);
  const [error, setError] = useState("");

  const submitUrl = "https://eoh1vexlplfjoih.m.pipedream.net";
  const { sendRequest, data, isLoading, error: fetchError } = useFetch<{
    accepted: boolean;
    bidSessionId?: string;
    paymentClientSecret?: string;
    message?: string;
  }>(submitUrl);

  if (!state.product) return <h1>No product selected</h1>;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    navigate("/delivery");
    /*
    sendRequest(
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        mode: "cors",
        body: JSON.stringify({
          productId: state.product?.id,
          amount: bidAmount,          
        }),
      },
      "Failed to submit bid"
    );*/
  };

  React.useEffect(() => {
    if (data) {
      if (!data.accepted) {
        setError(data.message || "Your bid is too LOW! Retry again.");
        return;
      }

      dispatch({ type: "SET_BID", bidPrice: bidAmount });
      navigate("/payment");
    }
  }, [data]);

  return (
    <Box className="bid-container">
      <Card className="bid-card">
        <CardContent>
          <Typography variant="h5" gutterBottom>
            Place your bid for: {state.product.title}
          </Typography>

          <Box className="bid-image-container">
            <img src={state.product.image} alt={state.product.title} />
          </Box>

          <Typography variant="body1" gutterBottom>
            Original price: {state.product.price.toFixed(2)} {state.product.currency}
          </Typography>

          <form className="bid-form" onSubmit={handleSubmit}>
            <TextField
              label="Enter your bid"
              type="number"
              value={bidAmount}
              onChange={(e) => setBidAmount(Number(e.target.value))}
              fullWidth
              required
            />
            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              sx={{ mt: 2 }}
              disabled={isLoading}
            >
              {isLoading ? "Submitting..." : "Submit Bid"}
            </Button>
          </form>

          {error && <Typography color="error" sx={{ mt: 1 }}>{error}</Typography>}
          {fetchError && <Typography color="error" sx={{ mt: 1 }}>{fetchError}</Typography>}
        </CardContent>
      </Card>
    </Box>
  );
};

export default Bid;
