import { useState, useEffect } from "react";
import { Box, Button, Paper, Typography, FormControlLabel, Checkbox } from "@mui/material";
import PhoneInput from "react-phone-input-2";
import 'react-phone-input-2/lib/style.css';
import { useNavigate } from "react-router-dom";
import BeatLoader from "@utils/beatloader/BeatLoader";
import usePostData from "@hook/fetchData";

import mobilepayImg from "@assets/mobilepayicon.svg";
import type { MobilePay } from "@interfaces/MobilePay";
import "@components/payment/Payment.css"
import { createMockPaymentIntent } from "@utils/createMockPaymentIntent";
import { useCheckout } from "@context/CheckoutContext";

const submitUrl = "https://eobr8yycab7ojzy.m.pipedream.net";

const MobilePayForm = () => {
  const [form, setForm] = useState<MobilePay>({ mobilePayNumber: "", countryCode: "+45", check: false });
  const { sendRequest, setError, status, isLoading, error } = usePostData<string>(submitUrl);
  const navigate = useNavigate();
  const {dispatch}= useCheckout();

  useEffect(() => {
    if (status === 200){
      const { paymentIntentId } = createMockPaymentIntent();
          
      dispatch({type: "SET_PAYMENT_INTENT", paymentIntentId,});
      navigate("/submit");
    } 
  }, [status, navigate, dispatch]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    navigate("/submit"); 

    // Basic validation: must have a number
    if (!form.mobilePayNumber) return;

    sendRequest(
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "mobilepay", ...form }),
      },
      "Error submitting MobilePay"
    );
  };
  

  return (
    <Paper elevation={3}
     className="payment-form"
    >
      <Typography variant="h6" sx={{textAlign: "center", mb: 3, fontSize: { xs: '1rem', sm: '1.25rem', md: '1.5rem' }}}>Betal via MobilePay</Typography>

      <Box textAlign="center" sx={{ mb: 3 }}>
        <img src={mobilepayImg} alt="MobilePay" className="mobilepay-Img" />
      </Box>

      {error ? (
        <Box textAlign="center">
          <Typography color="error" sx={{ mb: 2 }}>{error}</Typography>
          <Button variant="contained" onClick={() => setError("")}>Prøv igen</Button>
        </Box>
      ) : (
        <Box component="form" onSubmit={handleSubmit} noValidate>
          {/* Phone input */}
          <PhoneInput
            country={"dk"}
            value={form.mobilePayNumber}
            onChange={(phone, countryData) => {
              const data = countryData as { dialCode: string };
              setForm({
              mobilePayNumber: phone,
              countryCode: `+${data.dialCode}`,
              check: form.check,
            })}}
            inputStyle={{ width: "100%" }}
            containerStyle={{ marginBottom: "16px" }}
            inputProps={{ name: "mobilePayNumber", required: true }}
          />

          {/* Checkbox */}
          <FormControlLabel
            control={<Checkbox checked={form.check} onChange={() => setForm({ ...form, check: !form.check })} />}
            label="Husk mig til næste gang"
            sx={{ mb: 2 }}
          />

          <Button type="submit" fullWidth variant="contained" sx={{ borderRadius: 5 }} disabled={isLoading}>
            {isLoading ? <BeatLoader /> : "Bekræft Betaling"}
          </Button>
        </Box>
      )}
    </Paper>
  );
};

export default MobilePayForm;
