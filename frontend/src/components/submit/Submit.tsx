// src/components/submit/Submit.tsx
import { Box, Card, CardContent, Typography, Button, Divider, CircularProgress } from "@mui/material";
import { useCheckout } from "@context/CheckoutContext";
import { useNavigate } from "react-router-dom";
import useFetch from "@hook/fetchData"; // your custom hook
import "@components/submit/Submit.css";

export default function Submit() {
  const { state } = useCheckout();
  const navigate = useNavigate();

  // Use your useFetch hook
  const { sendRequest, isLoading, error } = useFetch("http://localhost:5000/api/checkout");

  const handlePlaceOrder = () => {
    sendRequest(
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: state.product?.id,
          bidPrice: state.bidPrice,
          address: state.address,
          paymentIntentId: state.paymentIntentId,
        }),
      },
      "Failed to submit order"
    );

    // Optionally, wait for status and redirect
    setTimeout(() => navigate("/"), 1000); // redirect after 1s for demo purposes
  };

  return (
    <Box className="submit-page" sx={{ display: "flex", justifyContent: "center", mt: 5 }}>
      <Card sx={{ width: { xs: "90%", sm: 500 }, p: 2, boxShadow: 4 }}>
        <CardContent>
          <Typography variant="h5" gutterBottom sx={{ textAlign: "center", mb: 2 }}>
            Confirm Your Order
          </Typography>

          <Divider sx={{ mb: 2 }} />

          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle1">Product:</Typography>
            <Typography variant="body1">{state.product?.title}</Typography>
          </Box>

          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle1">Bid Price:</Typography>
            <Typography variant="body1">{state.bidPrice}</Typography>
          </Box>

          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle1">Shipping Address:</Typography>
            <Typography variant="body1">
              {state.address
                ? `${state.address.firstName} ${state.address.lastName}, ${state.address.street}, ${state.address.city}, ${state.address.postalCode}, ${state.address.country}`
                : "No address provided"}
            </Typography>
          </Box>

          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1">Payment ID:</Typography>
            <Typography variant="body1">{state.paymentIntentId}</Typography>
          </Box>

          {error && (
            <Typography color="error" sx={{ mb: 2, textAlign: "center" }}>
              {error}
            </Typography>
          )}

          <Button
            variant="contained"
            color="primary"
            fullWidth
            sx={{ py: 1.5, borderRadius: 3 }}
            onClick={handlePlaceOrder}
            disabled={isLoading}
          >
            {isLoading ? <CircularProgress size={24} /> : "Place Order"}
          </Button>
        </CardContent>
      </Card>
    </Box>
  );
}
