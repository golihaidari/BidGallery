import { Box, Typography } from "@mui/material";
import GradientButton from "@utils/GradientButton";
import { useNavigate } from "react-router-dom";

export default function OrderSuccess() {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        minHeight: "80vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        textAlign: "center",
        gap: 3,
        px: 2,
      }}
    >
      <Typography variant="h4" sx={{ fontWeight: "bold" }}>
        🎉 Order Successful!
      </Typography>
      <Typography variant="body1">
        Thank you for your purchase. Your order has been placed successfully.
      </Typography>

      <GradientButton
        variant="contained"
        onClick={() => navigate("/")}
        sx={{ mt: 2 }}
      >
        Back to Products
      </GradientButton>
    </Box>
  );
}
