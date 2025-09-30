import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Typography, TextField } from "@mui/material";
import useFetch from "@hook/fetchData";
import { useCheckout } from "@context/CheckoutContext";
import { useLocation } from "react-router-dom";
import FormTemplate from "@utils/FormTemplate";
import FormValidator from "@utils/UserFormValidator";

const submitUrl = "https://eoh1vexlplfjoih.m.pipedream.net";

const Bid: React.FC = () => {
  const { state, dispatch } = useCheckout();
  const navigate = useNavigate();

  const [fieldError, setFieldError] = useState("");
  const [bidAmount, setBidAmount] = useState<number>(0);

  const { sendRequest, isLoading, error: apiError, status  } = useFetch<{
    accepted: boolean;
    bidSessionId?: string;
    paymentClientSecret?: string;
    message?: string;
  }>(submitUrl);

  const location = useLocation();
  const selectedProduct = location.state?.product;
  if (!selectedProduct) return <h1>No product selected</h1>;

  // Validate input when field loses focus
  const onBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const err = FormValidator.validateField("bidAmount", e.target.value);
    setFieldError(err);
  };

  const handleSubmit = () => {
    const err = FormValidator.validateField("bidAmount", String(bidAmount));
    if (err) {
      setFieldError(err);
      return;
    }

    const options: RequestInit = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        productId: selectedProduct?.id,
        amount: bidAmount, 
      }),
      mode: "cors",
    };

    sendRequest(options, "Failed to submit bid");
  };

  useEffect(() => {
    if (status === 200) {
      // Add product to cart if not already there
      const alreadyInCart = state.cart.find(item => item.product.id === selectedProduct?.id);
      if (!alreadyInCart && selectedProduct) {
        dispatch({ 
          type: "ADD_TO_CART", 
          item: { product: selectedProduct, bidPrice: bidAmount } 
        });
      }

      navigate("/"); // navigate to product page
    }
  }, [status, dispatch, navigate, bidAmount, state.cart, selectedProduct]);

  return (
    <FormTemplate
      title={`Place your bid for: ${selectedProduct.title}`}
      submitLabel="Submit Bid"
      onSubmit={handleSubmit}
      loading={isLoading}
      error={apiError || ""}
    >
      <Box textAlign="center" 
        component="img"
        src={selectedProduct.image}
        alt={selectedProduct.title}
        sx={{ maxWidth: "100%", borderRadius: 2, mb: 3 }}
      />

      <Typography variant="body1" sx={{ mb: 2 }}>
        Original price: {selectedProduct.price.toFixed(2)}{" "}
        {selectedProduct.currency}
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
