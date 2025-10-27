import { useState, useEffect } from "react";
import { Box, FormControlLabel, Checkbox, Typography } from "@mui/material";
import PhoneInput from "react-phone-input-2";
import 'react-phone-input-2/lib/style.css';
import { useNavigate } from "react-router-dom";
import usePostData from "@hook/fetchData";
import mobilepayImg from "@assets/mobilepayicon.svg";
import type { MobilePay } from "@interfaces/MobilePay";
import { createMockPaymentIntent } from "@utils/createMockPaymentIntent";
import { useCheckout } from "@context/CheckoutContext";
import FormTemplate from "@components/common/FormTemplate";
import PaymentFormValidator from "@utils/PaymentFormValidator";
import "@components/extraCss/Payment.css"

const submitUrl = "https://eobr8yycab7ojzy.m.pipedream.net";

const MobilePayForm = () => {
  const [form, setForm] = useState<MobilePay>({
    mobilePayNumber: "",
    countryCode: "+45",
    check: false,
  });
  const [fieldError, setFieldError] = useState("");
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

  // Validate on blur
  const onBlur = () => {
    const errs = PaymentFormValidator.validateMobilePay({ phoneNumber: form.mobilePayNumber });
    setFieldError(errs.phoneNumber);
  };

  const handleSubmit = () => {
    const errs = PaymentFormValidator.validateMobilePay({ phoneNumber: form.mobilePayNumber });
    if (errs.phoneNumber) {
      setFieldError(errs.phoneNumber);
      return; // stop submit if invalid
    }

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
    <FormTemplate
      title="Pay via MobilePay"
      onSubmit={handleSubmit}
      loading={isLoading}
      error={apiError}
      retry={() => setError("")}
      submitLabel="Confirm Payment"
      disableSubmit={!form.mobilePayNumber}
    >
      <Box textAlign="center" sx={{ mb: 3 }}>
        <img src={mobilepayImg} alt="MobilePay" className="mobilepay-Img" />
      </Box>

      <PhoneInput
        country={"dk"}
        value={form.mobilePayNumber}
        onChange={(phone, countryData) => {
          const data = countryData as { dialCode: string };
          setForm({ ...form, mobilePayNumber: phone, countryCode: `+${data.dialCode}` });
        }}
        onBlur={onBlur}
        inputStyle={{ width: "100%" }}
        containerStyle={{ marginBottom: "16px" }}
        inputProps={{ name: "mobilePayNumber", required: true }}
      />

      {fieldError && (
        <Typography color="error" variant="body2" sx={{ mb: 1 }}>
          {fieldError}
        </Typography>
      )}

      <FormControlLabel
        control={
          <Checkbox
            checked={form.check}
            onChange={() => setForm({ ...form, check: !form.check })}
          />
        }
        label="Remember me next time"
        sx={{ mb: 2 }}
      />
    </FormTemplate>
  );
};

export default MobilePayForm;
