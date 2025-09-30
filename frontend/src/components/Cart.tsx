import React from "react";
import { Box, Typography, Divider } from "@mui/material";
import { useCheckout } from "@context/CheckoutContext";
import GradientButton from "@utils/GradientButton";
import FormTemplate from "@utils/FormTemplate";
import { useNavigate } from "react-router-dom";

const Cart: React.FC = () => {
  const navigate = useNavigate();
  const { state, dispatch } = useCheckout();

  // Calculate total dynamically
  const totalPrice = state.cart.reduce((sum, item) => sum + item.bidPrice, 0);

  const handleRemove = (productId: string) => {
    dispatch({ type: "REMOVE_FROM_CART", productId });
  };

  const handleCheckout = () => {
    // You can navigate to delivery/payment page
    navigate("/delivery");
  };

  return (
    <FormTemplate title="Your Cart" submitLabel="Proceed to Checkout" onSubmit={handleCheckout}>
      {state.cart.length === 0 ? (
        <Typography variant="body1" sx={{ mt: 2 }}>
          Your cart is empty.
        </Typography>
      ) : (
        <Box>
          {state.cart.map((item) => (
            <Box
              key={item.product.id}
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                mb: 2,
                p: 2,
                backgroundColor: "var(--card-bg)",
                borderRadius: "var(--border-radius)",
                boxShadow: "var(--card-shadow)",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <img
                  src={item.product.image}
                  alt={item.product.title}
                  style={{ width: 60, height: 60, objectFit: "cover", borderRadius: 8 }}
                />
                <Box>
                  <Typography variant="body1">{item.product.title}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Bid: {item.bidPrice.toFixed(2)} {item.product.currency}
                  </Typography>
                </Box>
              </Box>

              <GradientButton
                size="small"
                onClick={() => handleRemove(item.product.id)}
                sx={{ fontSize: "0.85rem" }}
              >
                Remove
              </GradientButton>
            </Box>
          ))}

          <Divider sx={{ my: 2 }} />

          <Typography variant="h6" sx={{ textAlign: "right", mb: 2 }}>
            Total: {totalPrice.toFixed(2)} {state.cart[0]?.product.currency || ""}
          </Typography>
        </Box>
      )}
    </FormTemplate>
  );
};

export default Cart;
