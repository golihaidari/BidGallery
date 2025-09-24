import { useState, useEffect } from "react";
import { Box, TextField } from "@mui/material";
import { useNavigate } from "react-router-dom";
import usePostData from "@hook/fetchData";
import giftCardIcon from "@assets/giftcardicon.png";
import type { GiftCard } from "@interfaces/GiftCard";
import { useCheckout } from "@context/CheckoutContext";
import { createMockPaymentIntent } from "@utils/createMockPaymentIntent";
import FormTemplate from "@utils/FormTemplate";
import PaymentFormValidator from "@utils/PaymentFormValidator";
import type { PaymentErrors } from "@utils/PaymentFormValidator";

const initialForm: GiftCard = { giftCardnumber: "", securityCode: "" };
const submitUrl = "https://eobr8yycab7ojzy.m.pipedream.net";

const GiftCardForm = () => {
  const [form, setForm] = useState<GiftCard>(initialForm);
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
    setForm({ ...form, [e.target.name]: e.target.value });
    setFieldErrors((prev) => ({ ...prev, [e.target.name]: "" })); // Clear error on change
  };

  const handleBlur = (field: keyof GiftCard) => (e: React.FocusEvent<HTMLInputElement>) => {
    e.preventDefault();
    const errs = PaymentFormValidator.validateGiftCard(form);
    setFieldErrors((prev) => ({ ...prev, [field]: errs[field] || "" }));
  };

  const handleSubmit = () => {
    const errs = PaymentFormValidator.validateGiftCard(form);
    setFieldErrors(errs);

    if (Object.keys(errs).length > 0) return; // Stop submit if errors

    sendRequest(
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "giftcard", ...form }),
      },
      "Error submitting giftcard"
    );
  };

  return (
    <FormTemplate
      title="Gift Card Payment"
      onSubmit={handleSubmit}
      loading={isLoading}
      error={apiError}
      retry={() => setError("")}
      submitLabel="Confirm Payment"
    >
      <Box textAlign="center" sx={{ mb: 3 }}>
        <img src={giftCardIcon} alt="Gift Card" className="giftcard-Img" />
      </Box>

      <TextField
        fullWidth
        margin="normal"
        label="Gift card number"
        name="giftCardnumber"
        value={form.giftCardnumber}
        onChange={handleChange}
        onBlur={handleBlur("giftCardnumber")}
        error={!!fieldErrors.giftCardnumber}
        helperText={fieldErrors.giftCardnumber}
        inputProps={{ inputMode: "numeric", maxLength: 19 }}
      />

      <TextField
        fullWidth
        label="Security code"
        name="securityCode"
        value={form.securityCode}
        onChange={handleChange}
        onBlur={handleBlur("securityCode")}
        error={!!fieldErrors.securityCode}
        helperText={fieldErrors.securityCode}
        inputProps={{ inputMode: "numeric", maxLength: 3 }}
        margin="normal"
      />
    </FormTemplate>
  );
};

export default GiftCardForm;
