import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, TextField, Button, Typography, Autocomplete } from "@mui/material";
import countries from "world-countries";
import { useCheckout } from "@context/CheckoutContext";
import type { Address } from "@interfaces/models/Address";
import "@components/delivery/ShippingAddress.css";

// Sorted country list
const countryList = countries.map((c) => c.name.common).sort();

export default function ShippingAddress() {
  const navigate = useNavigate();
  const { dispatch, state } = useCheckout();

  const [address, setAddress] = useState<Address>(
    state.address || {
      firstName: "",
      lastName: "",
      email: "",
      mobileNr: "",
      country: "Denmark",
      postalCode: "",
      city: "",
      street: "",
      address: "",
    }
  );

  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setAddress((prev) => ({ ...prev, [name]: value }));
  };

  const handleNext = () => {
    if (!address.firstName || !address.lastName || !address.street || !address.city || !address.postalCode) {
      setError("Please fill all required fields");
      return;
    }
    dispatch({ type: "SET_ADDRESS", address });
    navigate("/payment");
  };

  return (
    <Box className="shipping-box">
      <Typography variant="h5" gutterBottom sx={{mb:2}}>
        Shipping Address
      </Typography>

      {error && (
        <Typography color="error" gutterBottom>
          {error}
        </Typography>
      )}

      <Box
        component="form"
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, // 1 column on mobile, 2 on tablet+
          gap: 3,
        }}
      >
        <TextField label="First Name" name="firstName" value={address.firstName} onChange={handleChange} fullWidth />
        <TextField label="Last Name" name="lastName" value={address.lastName} onChange={handleChange} fullWidth />
        <TextField label="Email" name="email" value={address.email} onChange={handleChange} fullWidth />
        <TextField label="Mobile Number" name="mobileNr" value={address.mobileNr} onChange={handleChange} fullWidth />
        <Autocomplete
          options={countryList}
          value={address.country}
          onChange={(_, value) => setAddress((prev) => ({ ...prev, country: value || "" }))}
          renderInput={(params) => <TextField {...params} label="Country" fullWidth />}
        />
        <TextField label="Postal Code" name="postalCode" value={address.postalCode} onChange={handleChange} fullWidth />
        <TextField label="City" name="city" value={address.city} onChange={handleChange} fullWidth />
        <TextField label="Street Address" name="street" value={address.street} onChange={handleChange} fullWidth />
        <TextField label="Address Line 2 (optional)" name="address" value={address.address} onChange={handleChange} fullWidth sx={{ gridColumn: "1 / -1" }} />
      </Box>

      <Button variant="contained" color="primary" fullWidth sx={{ mt: 3 }} onClick={handleNext}>
        Next
      </Button>
    </Box>
  );
}
