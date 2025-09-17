import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Paper,
  TextField,
  Typography,
  InputAdornment,
  MenuItem,
} from "@mui/material";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import type { CreditCard } from "../../interfaces/CreditCard";
import usePostData from "../../hook/fetchData";
import BeatLoader from "../../beatloader/BeatLoader";
import "./Form.css";

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
  const { sendRequest, setError, status, isLoading, error } =
    usePostData<string>(submitUrl);
  const navigate = useNavigate();

  useEffect(() => {
    if (status === 200) navigate("/products");
  }, [status, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPayment({ ...payment, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
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
    <Paper
      elevation={3}
      className="payment-form"
      sx={{ p: 4, maxWidth: 460, mx: "auto", borderRadius: 3 }}
    >
      <Typography variant="h6" sx={{ mb: 3 }}>
        Payment Details
      </Typography>

      {error ? (
        <Box textAlign="center">
          <Typography color="error" sx={{ mb: 2 }}>
            {error}
          </Typography>
          <Button variant="contained" onClick={() => setError("")}>
            Try Again
          </Button>
        </Box>
      ) : (
        <Box component="form" onSubmit={handleSubmit} noValidate>
          {/* Cardholder Name */}
          <TextField
            fullWidth
            label="Cardholder Name"
            name="cardHolder"
            margin="normal"
            value={payment.cardHolder}
            onChange={handleChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <PersonOutlineIcon />
                </InputAdornment>
              ),
            }}
          />

          {/* Card Number */}
          <TextField
            fullWidth
            label="Card Number"
            name="cardNumber"
            margin="normal"
            value={payment.cardNumber}
            onChange={handleChange}
            inputProps={{ maxLength: 16 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <CreditCardIcon />
                </InputAdornment>
              ),
            }}
          />

          {/* Expiration + CVV */}
          <Box sx={{display: "flex", gap: 15}}>          
            <Box sx={{ display: "flex", gap: 1, mt: 2 }}>
              <TextField
                select
                sx={{ width: 100 }}
                label="Expiry Month"
                name="expiryMonth"
                value={payment.expiryMonth}
                onChange={handleChange}
              >
                <MenuItem value="" disabled>
                  MM
                </MenuItem>
                <MenuItem value="01">01</MenuItem>
                <MenuItem value="02">02</MenuItem>
                <MenuItem value="03">03</MenuItem>
                <MenuItem value="04">04</MenuItem>
                <MenuItem value="05">05</MenuItem>
                <MenuItem value="06">06</MenuItem>
                <MenuItem value="07">07</MenuItem>
                <MenuItem value="08">08</MenuItem>
                <MenuItem value="09">09</MenuItem>
                <MenuItem value="10">10</MenuItem>
                <MenuItem value="11">11</MenuItem>
                <MenuItem value="12">12</MenuItem>
              </TextField>

              <TextField
                select
                sx={{ width: 100 }}
                label="Expiry Year"
                name="expiryYear"
                value={payment.expiryYear}
                onChange={handleChange}
              >
                <MenuItem value="" disabled>
                  YY
                </MenuItem> 
                <MenuItem value="25">25</MenuItem>
                <MenuItem value="26">26</MenuItem>
                <MenuItem value="27">27</MenuItem>
                <MenuItem value="28">28</MenuItem>
                <MenuItem value="29">29</MenuItem>
                <MenuItem value="30">30</MenuItem>
                <MenuItem value="31">31</MenuItem>
                <MenuItem value="32">32</MenuItem>
                <MenuItem value="33">33</MenuItem>
                <MenuItem value="34">34</MenuItem>
                <MenuItem value="35">35</MenuItem>
              </TextField>           
            </Box>

            <TextField
              sx={{ width: 100 }}
              label="CVC"
              placeholder="123"
              name="cvcNumber"
              margin="normal"
              value={payment.cvcNumber}
              onChange={handleChange}
              inputProps={{
                maxLength: 3,
                pattern: "\\d{3}", // Accepts 3 digits only
                title: "CVV must be 3 digits",
              }}
            />
          </Box>

          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, borderRadius: 5 }}
            disabled={isLoading}
          >
            {isLoading ? <BeatLoader /> : "Confirm"}
          </Button>
        </Box>
      )}
    </Paper>
  );
};

export default CreditCardForm;
