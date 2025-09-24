import { useState } from "react";
import { Box, Card } from "@mui/material";
import PaymentOptions from "./Options";
import CreditCardForm from "./forms/CreditCard";
import MobilePayForm from "./forms/MobilePay";
import GiftCardForm from "./forms/GiftCard";
import { PaymentType } from "./PaymentType";
import "./Payment.css";

const Payment = () => {
  const [paymentType, setPaymentType] = useState<string>(PaymentType.creditCard);

  return (
    <Box className="payment-container">
      <PaymentOptions paymentType={paymentType} setPaymentType={setPaymentType} />

      <Card className="payment-card">
        {paymentType === PaymentType.creditCard && <CreditCardForm />}
        {paymentType === PaymentType.mobilePay && <MobilePayForm />}
        {paymentType === PaymentType.giftCard && <GiftCardForm />}
      </Card>
    </Box>
  );
};

export default Payment;
