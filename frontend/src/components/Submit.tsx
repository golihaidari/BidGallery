import { Box, Typography, TextField } from "@mui/material";
import { useCheckout } from "@context/CheckoutContext";
import { useNavigate } from "react-router-dom";
import useFetch from "@hook/fetchData";
import FormTemplate from "@utils/FormTemplate";
import type { CartItem } from "@interfaces/CheckoutData";

export default function Submit() {
  const { state } = useCheckout();
  const navigate = useNavigate();
  const { sendRequest, isLoading, error } = useFetch(
    "http://localhost:5000/api/checkout"
  );

  const handlePlaceOrder = () => {
    sendRequest(
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cart: state.cart.map(item => ({
            productId: item.product.id,
            bidPrice: item.bidPrice,
          })),
          address: state.address,
          paymentIntentId: state.paymentIntentId,
        }),
      },
      "Failed to submit order"
    );

    setTimeout(() => navigate("/orderSuccess"), 5000); // redirect after 5s for demo
  };

  if (!state.cart || state.cart.length === 0) return <h1>No products in cart</h1>;

  const addressText = state.address
    ? `${state.address.firstName} ${state.address.lastName}\n${state.address.street}\n${state.address.city}, ${state.address.postalCode}\n${state.address.country}`
    : "No address provided";

  return (
    <FormTemplate
      title="Order Receipt"
      onSubmit={handlePlaceOrder}
      loading={isLoading}
      submitLabel="Confirm Order"
      error={error}
    >
      <Box sx={{ maxWidth: 700, mx: "auto", display: "flex", flexDirection: "column", gap: 2 }}>
        {/* Cart items */}
        {state.cart.map((item: CartItem, index: number) => (
          <Box
            key={index}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              p: 2,
              borderRadius: 2,
              backgroundColor: "var(--card-bg)",
              boxShadow: "0px 2px 8px rgba(0,0,0,0.1)",
            }}
          >
            <Box
              component="img"
              src={item.product.image}
              alt={item.product.title}
              sx={{ width: 80, height: 80, borderRadius: 1, objectFit: "cover" }}
            />
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="subtitle1">{item.product.title}</Typography>
              <Typography variant="body2">
                Bid Price: {item.bidPrice} {item.product.currency}
              </Typography>
            </Box>
          </Box>
        ))}

        {/* Shipping address */}
        <TextField
          label="Shipping Address"
          value={addressText}
          fullWidth
          multiline
          minRows={3}
          disabled
          variant="outlined"
          InputProps={{ readOnly: true }}
        />

        {/* Payment ID */}
        <TextField
          label="Payment ID"
          value={state.paymentIntentId}
          fullWidth
          disabled
          variant="outlined"
          InputProps={{ readOnly: true }}
        />
      </Box>
    </FormTemplate>
  );
}
