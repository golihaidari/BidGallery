import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Typography, TextField } from "@mui/material";
import useFetch from "@hook/fetchData";
import { useCheckout } from "@context/CheckoutContext";
import FormTemplate from "@utils/FormTemplate";
import FormValidator from "@utils/UserFormValidator";

const submitUrl = "https://eoh1vexlplfjoih.m.pipedream.net";

const Bid: React.FC = () => {
  const { state, dispatch } = useCheckout();
  const navigate = useNavigate();

  // Local validation error for the bid input
  const [fieldError, setFieldError] = useState("");
  const [bidAmount, setBidAmount] = useState<number>(0);

  const { sendRequest, isLoading, error: apiError, status  } = useFetch<{
    accepted: boolean;
    bidSessionId?: string;
    paymentClientSecret?: string;
    message?: string;
  }>(submitUrl);

  if (!state.product) return <h1>No product selected</h1>;

  // Validate when the field loses focus
  const onBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const err = FormValidator.validateField("bidAmount", e.target.value);
    setFieldError(err);
  };

  const handleSubmit = () => {
    const err = FormValidator.validateField("bidAmount", String(bidAmount));
    if (err) {
      setFieldError(err);
      return; // Stop submit if invalid
    }

    const options: RequestInit = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        productId: state.product?.id,
        amount: bidAmount, }),
      mode: "cors", // explicitly added
    };

    sendRequest( options, "Failed to submit bid");
  };

  useEffect(() => {
    if (status === 200) {
      dispatch({ type: "SET_BID", bidPrice: bidAmount });
      navigate("/delivery");
    }
  }, [status, dispatch, navigate, bidAmount]);

  return (
    <FormTemplate
      title={`Place your bid for: ${state.product.title}`}
      submitLabel="Submit Bid"
      onSubmit={handleSubmit}
      loading={isLoading}
      // Show API error OR local field error
      error={apiError || ""}
    >
      <Box textAlign="center" sx={{ mb: 3 }}>
        <img
          src={state.product.image}
          alt={state.product.title}
          style={{ maxWidth: "100%", borderRadius: 8 }}
        />
      </Box>

      <Typography variant="body1" sx={{ mb: 2 }}>
        Original price: {state.product.price.toFixed(2)}{" "}
        {state.product.currency}
      </Typography>

      <TextField
        fullWidth
        label="Enter your bid"
        type="number"
        value={bidAmount}
        onChange={(e) => setBidAmount(Number(e.target.value))}
        onBlur={onBlur}
        error={!!fieldError}
        helperText={fieldError}
      />
    </FormTemplate>
  );
};

export default Bid;
