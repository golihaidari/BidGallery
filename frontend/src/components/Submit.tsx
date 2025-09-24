import { Box, Typography, TextField } from "@mui/material";
import { useCheckout } from "@context/CheckoutContext";
import { useNavigate } from "react-router-dom";
import useFetch from "@hook/fetchData";
import FormTemplate from "@utils/FormTemplate";

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
          productId: state.product?.id,
          bidPrice: state.bidPrice,
          address: state.address,
          paymentIntentId: state.paymentIntentId,
        }),
      },
      "Failed to submit order"
    );

    setTimeout(() => navigate("/"), 1000); // redirect after 1s for demo
  };

  if (!state.product) return <h1>No product selected</h1>;

  const addressText = state.address
    ? `${state.address.firstName} ${state.address.lastName}\n${state.address.street}\n${state.address.city}, ${state.address.postalCode}\n${state.address.country}`
    : "No address provided";

  return (
    <FormTemplate
      title="Confirm Your Order"
      onSubmit={handlePlaceOrder}
      loading={isLoading}
      submitLabel="Place Order"
      error={error}
    >
      {/* Product image */}
      <Box textAlign="center" sx={{ mb: 3 }}>
        <img
          src={state.product.image}
          alt={state.product.title}
          style={{ maxWidth: "100%", borderRadius: 4 }}
        />
      </Box>

      {/* Two-column details */}
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {[
          { label: "Product", value: state.product.title },
          { label: "Bid Price", value: state.bidPrice },
          {
            label: "Shipping Address",
            value: addressText,
            multiline: true,
            minRows: 3,
          },
          { label: "Payment ID", value: state.paymentIntentId },
        ].map((item) => (
          <Box
            key={item.label}
            sx={{ display: "flex", gap: 2, alignItems: "flex-start" }}
          >
            {/* Left column: label */}
            <Typography sx={{ minWidth: 130, fontWeight: 500 }}>
              {item.label}:
            </Typography>

            {/* Right column: read-only TextField */}
            <TextField
              value={item.value}
              fullWidth
              size="small"
              InputProps={{
                readOnly: true,
              }}
              variant="outlined"
              multiline={item.multiline || false}
              minRows={item.minRows || 1}
            />
          </Box>
        ))}
      </Box>
    </FormTemplate>
  );
}
