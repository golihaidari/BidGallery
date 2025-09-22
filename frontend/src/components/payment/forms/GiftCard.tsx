import { useState, useEffect } from "react";
import { Box, Button, Paper, TextField, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import usePostData from "@hook/fetchData";
import giftCardIcon from "@assets/giftcardicon.png";
import BeatLoader from "@utils/beatloader/BeatLoader";
import type { GiftCard } from "@interfaces/GiftCard";
import "@components/payment/Payment.css"
import { useCheckout } from "@context/CheckoutContext";
import { createMockPaymentIntent } from "@utils/createMockPaymentIntent";

const initialForm: GiftCard = { giftCardnumber: "", securityCode: "" };
const submitUrl = "https://eobr8yycab7ojzy.m.pipedream.net";

const GiftCardForm = () => {
  const [form, setForm] = useState<GiftCard>(initialForm);
  const { sendRequest, setError, status, isLoading, error } = usePostData<string>(submitUrl);
  const navigate = useNavigate();
  const {dispatch} =  useCheckout();

  useEffect(() => {
    if (status === 200) {
      const { paymentIntentId } = createMockPaymentIntent();
    
      dispatch({type: "SET_PAYMENT_INTENT", paymentIntentId,});
      navigate("/submit")
    };
  }, [status, navigate, dispatch]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation before sending
    if (!/^\d{18,19}$/.test(form.giftCardnumber) || !/^\d{3}$/.test(form.securityCode)) {
      return; // Do not submit if invalid
    }

    sendRequest(
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "giftcard", ...form }),
      },
      "Error submitting giftcard"
    );
  };

  const isGiftCardValid = /^\d{18,19}$/.test(form.giftCardnumber);
  const isSecurityCodeValid = /^\d{3}$/.test(form.securityCode);

  return (
    <Paper
      elevation={3}
      className="payment-form"
    >
      <Typography variant="h6" sx={{ textAlign: "center", mb: 3, fontSize: { xs: '1rem', sm: '1.25rem', md: '1.5rem' } }}>
        Gavekort Betaling
      </Typography>

      <Box textAlign="center" sx={{ mb: 3 }}>
        <img src={giftCardIcon} alt="Gift Card" className="giftcard-Img" />
      </Box>

      {error ? (
        <Box textAlign="center">
          <Typography color="error" sx={{ mb: 2 }}>
            {error}
          </Typography>
          <Button variant="contained" onClick={() => setError("")}>
            Prøv igen
          </Button>
        </Box>
      ) : (
        <Box component="form" onSubmit={handleSubmit} noValidate>
          {/* Gift Card Number */}
          <TextField
            fullWidth
            label="Gavekort Nummer"
            name="giftCardnumber"
            value={form.giftCardnumber}
            onChange={handleChange}
            margin="normal"
            required
            error={form.giftCardnumber !== "" && !isGiftCardValid}
            helperText={
              form.giftCardnumber !== "" && !isGiftCardValid
                ? "Gavekort nummer skal være 18 eller 19 cifre"
                : ""
            }
            inputProps={{ inputMode: "numeric", maxLength: 19 }}
          />

          {/* Security Code */}
          <TextField
            fullWidth
            label="Sikkerhedskode"
            name="securityCode"
            value={form.securityCode}
            onChange={handleChange}
            margin="normal"
            required
            error={form.securityCode !== "" && !isSecurityCodeValid}
            helperText={
              form.securityCode !== "" && !isSecurityCodeValid
                ? "Sikkerhedskode skal være 3 cifre"
                : ""
            }
            inputProps={{ inputMode: "numeric", maxLength: 3 }}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, borderRadius: 5 }}
            disabled={isLoading}
          >
            {isLoading ? <BeatLoader /> : "Bekræft Betaling"}
          </Button>
        </Box>
      )}
    </Paper>
  );
};

export default GiftCardForm;
