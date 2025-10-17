import { useState, useEffect } from "react";
import { Box, TextField, InputAdornment, MenuItem } from "@mui/material";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import { useNavigate } from "react-router-dom";
import usePostData from "@hook/fetchData";
import type { CreditCard } from "@interfaces/CreditCard";
import { useCheckout } from "@context/CheckoutContext";
import { createMockPaymentIntent } from "@utils/createMockPaymentIntent";
import FormTemplate from "@utils/FormTemplate";
import PaymentFormValidator from "@utils/PaymentFormValidator";
import type { PaymentErrors } from "@utils/PaymentFormValidator";

const initialPayment: CreditCard = {
  cardHolder: "",
  cardNumber: "",
  cvcNumber: "",
  expiryMonth: "01",
  expiryYear: "25",
};

const submitUrl = "https://eobr8yycab7ojzy.m.pipedream.net";

const CreditCardForm = () => {
  const [payment, setPayment] = useState<CreditCard>(initialPayment);
  const [fieldErrors, setFieldErrors] = useState<PaymentErrors>({});
  const { sendRequest, setError, status, isLoading, error: apiError } = usePostData<string>(submitUrl);
  const navigate = useNavigate();
  const { dispatch } = useCheckout();

  useEffect(() => {
    if (status === 200) {
      const { paymentIntentId } = createMockPaymentIntent();
      dispatch({ type: "SET_PAYMENT_INTENT", paymentIntentId });
      navigate("/submit");
    }
  }, [status, navigate, dispatch]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPayment({ ...payment, [e.target.name]: e.target.value });
    setFieldErrors((prev) => ({ ...prev, [e.target.name]: "" })); // clear error on change
  };

  const handleBlur = (field: keyof CreditCard) => (e: React.FocusEvent<HTMLInputElement>) => {
    e.preventDefault();
    const errs = PaymentFormValidator.validateCreditCard(payment);
    setFieldErrors((prev) => ({ ...prev, [field]: errs[field] || "" }));
  };

  const handleSubmit = () => {
    const errs = PaymentFormValidator.validateCreditCard(payment);
    setFieldErrors(errs);

    // Stop submit if any errors
    if (Object.keys(errs).length > 0) return;

    sendRequest(
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "creditcard", ...payment }),
      },
      "Error submitting credit card"
    );
  };

  return (
    <FormTemplate
      title="Payment Details"
      onSubmit={handleSubmit}
      loading={isLoading}
      error={apiError || ""}
      retry={() => setError("")}
      submitLabel="Confirm Payment"
      disableSubmit={ !payment.cardHolder || !payment.cardNumber  || payment.cvcNumber.length < 3}
    >
      <TextField
        fullWidth
        label="Cardholder Name"
        name="cardHolder"
        margin="normal"
        value={payment.cardHolder}
        onChange={handleChange}
        onBlur={handleBlur("cardHolder")}
        error={!!fieldErrors.cardHolder}
        helperText={fieldErrors.cardHolder}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <PersonOutlineIcon />
            </InputAdornment>
          ),
        }}
      />

      <TextField
        fullWidth
        label="Card Number"
        name="cardNumber"
        margin="normal"
        value={payment.cardNumber}
        onChange={handleChange}
        onBlur={handleBlur("cardNumber")}
        error={!!fieldErrors.cardNumber}
        helperText={fieldErrors.cardNumber}
        inputProps={{ maxLength: 19 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <CreditCardIcon />
            </InputAdornment>
          ),
        }}
      />

      {/* Expiration + CVC */}
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
        <Box sx={{ display: "flex", gap: 1, mt: 2 }}>
          <TextField
            select
            sx={{ width: 100 }}
            label="Expiry Month"
            name="expiryMonth"
            value={payment.expiryMonth}
            onChange={handleChange}
            onBlur={handleBlur("expiryMonth")}
            error={!!fieldErrors.expiryMonth}
            helperText={fieldErrors.expiryMonth}
          >
            <MenuItem value="" disabled>
              MM
            </MenuItem>
            {Array.from({ length: 12 }, (_, i) => (
              <MenuItem key={i} value={(i + 1).toString().padStart(2, "0")}>
                {(i + 1).toString().padStart(2, "0")}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            select
            sx={{ width: 100 }}
            label="Expiry Year"
            name="expiryYear"
            value={payment.expiryYear}
            onChange={handleChange}
            onBlur={handleBlur("expiryYear")}
            error={!!fieldErrors.expiryYear}
            helperText={fieldErrors.expiryYear}
          >
            <MenuItem value="" disabled>
              YY
            </MenuItem>
            {Array.from({ length: 11 }, (_, i) => (
              <MenuItem key={i} value={(25 + i).toString()}>
                {25 + i}
              </MenuItem>
            ))}
          </TextField>
        </Box>

        <TextField
          sx={{ width: 100, ml: "auto" }}
          label="CVC"
          placeholder="123"
          name="cvcNumber"
          margin="normal"
          value={payment.cvcNumber}
          onChange={handleChange}
          onBlur={handleBlur("cvcNumber")}
          error={!!fieldErrors.cvcNumber}
          helperText={fieldErrors.cvcNumber}
          inputProps={{
            maxLength: 4,
            pattern: "\\d{3,4}",
            title: "CVC must be 3 or 4 digits",
          }}
        />
      </Box>
    </FormTemplate>
  );
};

export default CreditCardForm;
