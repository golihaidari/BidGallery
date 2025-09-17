import { PaymentType } from "./PaymentType";
import { RadioGroup, FormControlLabel, Radio, Box } from "@mui/material";

const PaymentOptions = ({
  paymentType,
  setPaymentType,
}: {
  paymentType: string;
  setPaymentType: (type: string) => void;
}) => {
  return (
    <Box className="payment-options">
      <RadioGroup
        row
        value={paymentType}
        onChange={(e) => setPaymentType(e.target.value)}
        sx={{ justifyContent: "center", gap: 3 }}
      >
        <FormControlLabel
          value={PaymentType.creditCard}
          control={<Radio />}
          label="Credit Card"
        />
        <FormControlLabel
          value={PaymentType.mobilePay}
          control={<Radio />}
          label="MobilePay"
        />
        <FormControlLabel
          value={PaymentType.giftCard}
          control={<Radio />}
          label="Gift Card"
        />
      </RadioGroup>
    </Box>
  );
};

export default PaymentOptions;
