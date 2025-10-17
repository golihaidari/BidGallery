import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Box, Typography, TextField } from "@mui/material";
import useFetch from "@hook/fetchData";
import { useCheckout } from "@context/CheckoutContext";
import FormTemplate from "@utils/FormTemplate";
import FormValidator from "@utils/UserFormValidator";
import InfoCard from "@components/InfoCard"; 
import { API_URL } from "../config.tsx";

const submitUrl = `${API_URL}/api/checkout/placebid`;

const Bid: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { state, dispatch } = useCheckout();

  const selectedProduct = location.state?.product;

  // ----------------------------
  // Hooks & state
  // ----------------------------
  const [bidAmount, setBidAmount] = useState<number>(0);
  const [fieldError, setFieldError] = useState<string>("");

  const [showResultCard, setShowResultCard] = useState(false);
  const [resultType, setResultType] = useState<"success" | "error" | "info">("info");
  const [resultMessage, setResultMessage] = useState<string>("");

  const { sendRequest, status, data, error: apiError, isLoading, reset } = 
    useFetch<{ message?: string }>(submitUrl);

  // ----------------------------
  // Validate input on blur
  // ----------------------------
  const onBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const err = FormValidator.validateField("bidAmount", e.target.value);
    setFieldError(err);
  };

  // ----------------------------
  // Submit bid
  // ----------------------------
  const handleSubmit = () => {
    if (!selectedProduct) return;

    const err = FormValidator.validateField("bidAmount", String(bidAmount));
    if (err) {
      setFieldError(err);
      return;
    }

    if (bidAmount <= 0) {
      setFieldError("Bid must be greater than 0");
      return;
    }

    setFieldError("");

    // Reset old API state to avoid stale data
    reset();

    sendRequest(
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: selectedProduct.id,
          amount: bidAmount,
        }),
        mode: "cors",
      },
      "Failed to submit bid"
    );
  };

  // ----------------------------
  // Handle API response
  // ----------------------------
  useEffect(() => {
    if (!selectedProduct) return;

    if (status === 200 && data?.message) {
      // Bid accepted
      setResultType("success");
      setResultMessage(data.message);
      setShowResultCard(true);

      // Add to cart in context
      const alreadyInCart = state.cart.find(
        (item) => item.product.id === selectedProduct.id
      );
      if (!alreadyInCart) {
        dispatch({
          type: "ADD_TO_CART",
          item: { product: selectedProduct, bidPrice: bidAmount },
        });
      }
    } else if (status !== 200 && (apiError || data?.message)) {
      // Show error message
      setResultType("error");
      setResultMessage(data?.message || apiError || "Failed to submit bid");
      setShowResultCard(true);
    }
  }, [status, data, apiError, dispatch, selectedProduct]);

  // ----------------------------
  // Render
  // ----------------------------
  if (!selectedProduct)
    return (
      <InfoCard
        title="No product selected"
        message="Please select a product to place a bid."
        type="info"
        firstBtnLabel="Go to Products"
        firstBtnAction={() => navigate("/")}
      />
    );

  if (showResultCard)
    return (
      <InfoCard
        title={resultType === "success" ? "Success!" : "Error!"}
        message={resultMessage}
        type={resultType}
        firstBtnLabel={resultType === "success" ? "Continue to Checkout" : "Retry"}
        firstBtnAction={() => {
          if (resultType === "success") {
            navigate("/cart");
          } else {
            reset(); // reset the fetch state

            // Reset form & fetch hook for retry
            setShowResultCard(false);
            setResultType("info");
            setResultMessage("");
            setBidAmount(0);
          }
        }}
        secondBtnLabel={resultType === "success" ? "Add More Items" : "Go to Products"}
        secondBtnAction={() =>
          resultType === "success" ? navigate("/") : navigate("/")
        }
      />
    );

  return (
    <FormTemplate
      title={`Place your bid for: ${selectedProduct.title}`}
      submitLabel="Submit Bid"
      onSubmit={(e) => {
        e.preventDefault();
        handleSubmit();
      }}
      loading={isLoading}
      error={fieldError}
      disableSubmit={bidAmount <= 0} 
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          gap: 3,
          alignItems: "flex-start",
          position: "relative",
        }}
      >
        {/* Left column: Image */}
        <Box sx={{ flex: "1 1 60%", position: "relative" }}>
          <Box
            component="img"
            src={selectedProduct.imageUrl}
            alt={selectedProduct.title}
            sx={{ width: "100%", borderRadius: 2 }}
          />
          <Typography
            variant="caption"
            sx={{
              position: "absolute",
              top: 8,
              right: 8,
              color: "grey",
              fontSize: 12,
              backgroundColor: "rgba(246, 240, 240, 0.7)",
              padding: "2px 6px",
              borderRadius: 1,
            }}
          >
            Dev price: {selectedProduct.secretPrice.toFixed(2)}{" "}
            {selectedProduct.currency}
          </Typography>
        </Box>

        {/* Right column: Details + bid */}
        <Box sx={{ flex: "1 1 35%", display: "flex", flexDirection: "column", gap: 1 }}>
          <Typography variant="subtitle1">
            by: {selectedProduct.artistFirstName} {selectedProduct.artistLastName}
          </Typography>
          <Typography variant="body2">Style: {selectedProduct.style}</Typography>
          <Typography variant="body2">Year: {selectedProduct.yearCreated}</Typography>
          <Typography variant="body2">Size: {selectedProduct.productSize}</Typography>
          <Typography variant="body2">Added: {selectedProduct.dateAdded}</Typography>
          <Typography variant="body2" sx={{ mt: 1 }}>
            {selectedProduct.description}
          </Typography>
        </Box>
      </Box>

      <TextField
        fullWidth
        label="Enter your bid"
        type="number"
        value={bidAmount}
        onChange={(e) => setBidAmount(Number(e.target.value))}
        onBlur={onBlur}
        error={!!fieldError}
        helperText={fieldError}
        sx={{ mt: 2 }}
      />
    </FormTemplate>
  );
};

export default Bid;
