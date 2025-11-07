import { useState, useEffect } from "react";
import { Box, TextField, Autocomplete } from "@mui/material";
import countries from "world-countries";
import { useCheckout } from "@context/CheckoutContext";
import type { Address } from "@interfaces/Address";
import FormTemplate from "@components/common/FormTemplate.tsx";
import FormValidator, { type FormValues } from "@utils/UserFormValidator";
import { useNavigate } from "react-router-dom";
import useFetch from "@hook/fetchData";
import { API_CONFIG } from "../config.tsx";
import { useAuth } from "@context/AuthContext.tsx";

// Sorted country list
const countryList = countries.map((c) => c.name.common).sort();

export default function ShippingAddress() {
  const { dispatch, state } = useCheckout();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [address, setAddress] = useState<Address>(
    state.address || {
      firstName: "",
      lastName: "",
      email: "",
      mobileNr: "",
      country: "Denmark",
      postalCode: "",
      city: "",
      address1: "",
      address2: "",
    }
  );

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // --- useFetch hook for user data ---
  const { sendRequest, data: userData, error } =
    useFetch<{ address?: Address }>(`${API_CONFIG.baseURL}/auth/address`);

  // --- Automatically load address if user is logged in ---
  useEffect(() => {
    console.log("isAuthenticated?:", isAuthenticated);
    if(isAuthenticated){
      sendRequest({ 
        method: "GET",
        credentials: "include", 
      });
    }
  }, [isAuthenticated]);

  // --- Update form when server returns user address ---
  useEffect(() => {
    console.log("User data from API:", userData);
    if (userData?.address) {
      setAddress(userData.address);
    }
  }, [userData]);

  // --- Handle form field changes ---
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setAddress((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" })); // clear error on change
  };

  // --- Validate on blur ---
  const onBlur = (field: keyof Address) => (e: React.FocusEvent<HTMLInputElement>) => {
    const error = FormValidator.validateField(field, e.target.value, address as unknown as FormValues);
    setErrors((prev) => ({ ...prev, [field]: error }));
  };

  // --- Submit form ---
  const handleSubmit = () => {
    // Validate all required fields
    const fieldErrors: { [key: string]: string } = {
      firstName: FormValidator.validateField("firstName", address.firstName),
      lastName: FormValidator.validateField("lastName", address.lastName),
      email: FormValidator.validateField("email", address.email),
      mobileNr: FormValidator.validateField("mobileNr", address.mobileNr),
      postalCode: FormValidator.validateField("postalCode", address.postalCode),
      city: FormValidator.validateField("city", address.city),
      address1: FormValidator.validateField("address1", address.address1),
    };

    setErrors(fieldErrors);
    if (Object.values(fieldErrors).some(Boolean)) return; // stop if validation fails

    // Save address in checkout context
    dispatch({ type: "SET_ADDRESS", address });
    navigate("/payment");
  };

  return (
    <FormTemplate
      title="Shipping Address"
      onSubmit={handleSubmit}
      error={error || ""}
      submitLabel="Next"
      disableSubmit={
        !address.firstName ||
        !address.lastName ||
        !address.email ||
        !address.mobileNr ||
        !address.country ||
        !address.postalCode ||
        !address.city ||
        !address.address1
      }
    >
      {/* Grid layout for form fields */}
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
          freeSolo
          options={countryList}
          value={address.country}
          onChange={(_, value) => setAddress((prev) => ({ ...prev, country: value || "" }))}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Country"
              name="country"
              fullWidth
              error={!!errors.country}
              helperText={errors.country}
              onBlur={() => {
                if (!address.country || address.country.trim() === "") {
                  setErrors((prev) => ({ ...prev, country: "Country is required" }));
                }
              }}
            />
          )}
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
          label="Address 1"
          name="address1"
          value={address.address1}
          onChange={handleChange}
          onBlur={onBlur("address1")}
          error={!!errors.address1}
          helperText={errors.address1}
          fullWidth
        />
        <TextField
          label="Address 2 (optional)"
          name="address2"
          value={address.address2}
          onChange={handleChange}
          fullWidth
          sx={{ gridColumn: "1 / -1" }}
        />
      </Box>
    </FormTemplate>
  );
}
