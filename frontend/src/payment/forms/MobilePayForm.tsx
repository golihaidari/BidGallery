import { useState, useEffect } from "react";
import { Box, Button, Paper, Typography, FormControlLabel, Checkbox } from "@mui/material";
import PhoneInput from "react-phone-input-2";
import 'react-phone-input-2/lib/style.css';
import BeatLoader from "../../beatloader/BeatLoader";
import usePostData from "../../hook/fetchData";
import { useNavigate } from "react-router-dom";
import mobilepayImg from "../../assets/mobilepayicon.svg";
import type { MobilePay } from "../../interfaces/MobilePay";
import "./Form.css";

const submitUrl = "https://eobr8yycab7ojzy.m.pipedream.net";

const MobilePayForm = () => {
  const [form, setForm] = useState<MobilePay>({ mobilePayNumber: "", countryCode: "+45", check: false });
  const { sendRequest, setError, status, isLoading, error } = usePostData<string>(submitUrl);
  const navigate = useNavigate();

  useEffect(() => { if (status === 200) navigate("/products"); }, [status, navigate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
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
    <Paper elevation={3} className="payment-form" sx={{ p: 4, maxWidth: 460, mx: "auto", borderRadius: 3 }}>
      <Typography variant="h6" sx={{ mb: 3 }}>Betal via MobilePay</Typography>

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
