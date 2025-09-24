import { useState } from "react";
import { Box, TextField, Autocomplete } from "@mui/material";
import countries from "world-countries";
import { useCheckout } from "@context/CheckoutContext";
import type { Address } from "@interfaces/models/Address";
import FormTemplate from "@utils/FormTemplate";
import FormValidator from "@utils/UserFormValidator";
import { useNavigate } from "react-router-dom";

// Sorted country list
const countryList = countries.map((c) => c.name.common).sort();

export default function ShippingAddress() {
  const { dispatch, state } = useCheckout();

  const navigate = useNavigate();

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

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setAddress((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" })); // clear error on change
  };

  const onBlur = (field: keyof Address) => (e: React.FocusEvent<HTMLInputElement>) => {
    const error = FormValidator.validateField(field, e.target.value, address);
    setErrors((prev) => ({ ...prev, [field]: error }));
  };

  const handleSubmit = () => {
    const fieldErrors: { [key: string]: string } = {
      firstName: FormValidator.validateField("firstName", address.firstName),
      lastName: FormValidator.validateField("lastName", address.lastName),
      email: FormValidator.validateField("email", address.email),
      mobileNr: FormValidator.validateField("mobileNr", address.mobileNr),
      postalCode: FormValidator.validateField("postalCode", address.postalCode),
      city: FormValidator.validateField("city", address.city),
      street: FormValidator.validateField("street", address.street),
    };

    setErrors(fieldErrors);

    if (Object.values(fieldErrors).some(Boolean)) return; // stop if any error

    dispatch({ type: "SET_ADDRESS", address });
    navigate("/payment");
  };

  return (
    <FormTemplate
      title="Shipping Address"
      onSubmit={handleSubmit}
      error="" // this page doe not send data to api, so there is no api error.
      submitLabel="Next"
    >
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
          gap: 3,
        }}
      >
        <TextField
          label="First Name"
          name="firstName"
          value={address.firstName}
          onChange={handleChange}
          onBlur={onBlur("firstName")}
          error={!!errors.firstName}
          helperText={errors.firstName}
          fullWidth
        />
        <TextField
          label="Last Name"
          name="lastName"
          value={address.lastName}
          onChange={handleChange}
          onBlur={onBlur("lastName")}
          error={!!errors.lastName}
          helperText={errors.lastName}
          fullWidth
        />
        <TextField
          label="Email"
          name="email"
          value={address.email}
          onChange={handleChange}
          onBlur={onBlur("email")}
          error={!!errors.email}
          helperText={errors.email}
          fullWidth
        />
        <TextField
          label="Mobile Number"
          name="mobileNr"
          value={address.mobileNr}
          onChange={handleChange}
          onBlur={onBlur("mobileNr")}
          error={!!errors.mobileNr}
          helperText={errors.mobileNr}
          fullWidth
        />
        <Autocomplete
          options={countryList}
          value={address.country}
          onChange={(_, value) =>
            setAddress((prev) => ({ ...prev, country: value || "" }))
          }
          renderInput={(params) => <TextField {...params} label="Country" fullWidth />}
        />
        <TextField
          label="Postal Code"
          name="postalCode"
          value={address.postalCode}
          onChange={handleChange}
          onBlur={onBlur("postalCode")}
          error={!!errors.postalCode}
          helperText={errors.postalCode}
          fullWidth
        />
        <TextField
          label="City"
          name="city"
          value={address.city}
          onChange={handleChange}
          onBlur={onBlur("city")}
          error={!!errors.city}
          helperText={errors.city}
          fullWidth
        />
        <TextField
          label="Street Address"
          name="street"
          value={address.street}
          onChange={handleChange}
          onBlur={onBlur("street")}
          error={!!errors.street}
          helperText={errors.street}
          fullWidth
        />
        <TextField
          label="Address Line 2 (optional)"
          name="address"
          value={address.address}
          onChange={handleChange}
          fullWidth
          sx={{ gridColumn: "1 / -1" }}
        />
      </Box>
    </FormTemplate>
  );
}
