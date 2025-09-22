import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  TextField,
  Button,
  MenuItem,
  Typography,
  Box,
  Autocomplete,
} from "@mui/material";
import countries from "world-countries";
import "./register.css";

import type { User } from "@interfaces/models/User";
import type { Artist } from "@interfaces/models/Artist";
import type { Address } from "@interfaces/models/Address";
import usePostData from "@hook/fetchData";
import {useAuth} from "@context/AuthContext.tsx";

const countryList = countries.map((c) => c.name.common).sort();
const submitUrl = "https://url";

export default function Register() {
  const navigate = useNavigate();
  const {
    sendRequest,
    data,
    isLoading,
    error: fetchError,
    status,
    setError,
  } = usePostData<{ success: boolean; message?: string }>(submitUrl);

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    mobileNr: "",
    password: "",
    rePassword: "",
    accountType: "customer",
    country: "Denmark",
    postalCode: "",
    city: "",
    street: "",
    address: "",
    bio: "",
    style: "",
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { [key: string]: string } = {};

    // Basic validations
    if (!form.email) newErrors.email = "Email er påkrævet";
    else if (!/^\S+@\S+\.\S+$/.test(form.email))
      newErrors.email = "Email er ikke gyldig";

    if (!form.password) newErrors.password = "Password er påkrævet";
    else if (form.password.length < 6)
      newErrors.password = "Password skal være mindst 6 tegn";

    if (form.password !== form.rePassword)
      newErrors.rePassword = "Passwords matcher ikke";

    // Artist validations
    if (form.accountType === "artist") {
      if (!form.firstName) newErrors.firstName = "Fornavn er påkrævet";
      if (!form.lastName) newErrors.lastName = "Efternavn er påkrævet";
      if (!form.bio) newErrors.bio = "Bio er påkrævet";
      if (!form.style) newErrors.style = "Style er påkrævet";
    }

    // Customer address validations
    if (form.accountType === "customer") {
      if (!form.firstName) newErrors.firstName = "Fornavn er påkrævet";
      if (!form.lastName) newErrors.lastName = "Efternavn er påkrævet";
      if (!form.mobileNr) newErrors.mobileNr = "Mobilnummer er påkrævet";
      if (!form.postalCode) newErrors.postalCode = "Postnummer er påkrævet";
      if (!form.city) newErrors.city = "By er påkrævet";
      if (!form.street) newErrors.street = "Adresse er påkrævet";
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    const payload: { user: User; artist?: Artist | null; address?: Address | null } = {
      user: {
        email: form.email,
        password: form.password,
        accountType: form.accountType as "customer" | "artist",
      },
      artist:
        form.accountType === "artist"
          ? {
              firstName: form.firstName!,
              lastName: form.lastName!,
              bio: form.bio!,
              style: form.style!,
            }
          : null,
      address:
        form.accountType === "customer"
          ? {
              firstName: form.firstName!,
              lastName: form.lastName!,
              email: form.email!,
              mobileNr: form.mobileNr!,
              country: form.country!,
              postalCode: form.postalCode!,
              city: form.city!,
              street: form.street!,
              address: form.address!,
            }
          : null,
    };

    sendRequest(
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      },
      "Registration failed. Please try again."
    );
  };

  const {login }= useAuth();
  useEffect(() => {
    if (status === 200 && data?.success) {
      // Use token returned from backend
      login( form.email, data.message!);
      navigate("/");
    } else if (status && !data?.success) {
      setError(data?.message || "Registration failed. Retry again.");
    }
  }, [status, data, navigate, setError]);

  return (
      <Box className="register-box">
        <Typography variant="h5" gutterBottom sx={{ mb: 2 }}>
          Create Account
        </Typography>

        {fetchError && <Typography color="error">{fetchError}</Typography>}

        <form onSubmit={handleSignUp}>
          <Box className="register-grid">
            <TextField
              label="Email"
              name="email"
              value={form.email}
              onChange={handleChange}
              fullWidth
              error={!!errors.email}
              helperText={errors.email}
            />
            <TextField
              label="Password"
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              fullWidth
              error={!!errors.password}
              helperText={errors.password}
            />
            <TextField
              label="Re-enter Password"
              type="password"
              name="rePassword"
              value={form.rePassword}
              onChange={handleChange}
              fullWidth
              error={!!errors.rePassword}
              helperText={errors.rePassword}
            />
            <TextField
              select
              label="Account Type"
              name="accountType"
              value={form.accountType}
              onChange={handleChange}
              fullWidth
            >
              <MenuItem value="customer">Customer</MenuItem>
              <MenuItem value="artist">Artist</MenuItem>
            </TextField>

            {/* Artist Fields */}
            {form.accountType === "artist" && (
              <>
                <TextField
                  label="First Name"
                  name="firstName"
                  value={form.firstName}
                  onChange={handleChange}
                  fullWidth
                  error={!!errors.firstName}
                  helperText={errors.firstName}
                />
                <TextField
                  label="Last Name"
                  name="lastName"
                  value={form.lastName}
                  onChange={handleChange}
                  fullWidth
                  error={!!errors.lastName}
                  helperText={errors.lastName}
                />
                <TextField
                  label="Style"
                  name="style"
                  value={form.style}
                  onChange={handleChange}
                  fullWidth
                  error={!!errors.style}
                  helperText={errors.style}
                />
                <TextField
                  label="Bio"
                  name="bio"
                  multiline
                  rows={3}
                  value={form.bio}
                  onChange={handleChange}
                  fullWidth
                  error={!!errors.bio}
                  helperText={errors.bio}
                />
              </>
            )}

            {/* Customer Fields */}
            {form.accountType === "customer" && (
              <>
                <TextField
                  label="First Name"
                  name="firstName"
                  value={form.firstName}
                  onChange={handleChange}
                  fullWidth
                  error={!!errors.firstName}
                  helperText={errors.firstName}
                />
                <TextField
                  label="Last Name"
                  name="lastName"
                  value={form.lastName}
                  onChange={handleChange}
                  fullWidth
                  error={!!errors.lastName}
                  helperText={errors.lastName}
                />
                <TextField
                  label="Mobile Number"
                  name="mobileNr"
                  value={form.mobileNr}
                  onChange={handleChange}
                  fullWidth
                  error={!!errors.mobileNr}
                  helperText={errors.mobileNr}
                />
                <Autocomplete
                  options={countryList}
                  value={form.country}
                  onChange={(_, value) =>
                    setForm((prev) => ({ ...prev, country: value || "" }))
                  }
                  renderInput={(params) => (
                    <TextField {...params} label="Country" fullWidth />
                  )}
                />
                <TextField
                  label="Postal Code"
                  name="postalCode"
                  value={form.postalCode}
                  onChange={handleChange}
                  fullWidth
                  error={!!errors.postalCode}
                  helperText={errors.postalCode}
                />
                <TextField
                  label="City"
                  name="city"
                  value={form.city}
                  onChange={handleChange}
                  fullWidth
                  error={!!errors.city}
                  helperText={errors.city}
                />
                <TextField
                  label="Street"
                  name="street"
                  value={form.street}
                  onChange={handleChange}
                  fullWidth
                  error={!!errors.street}
                  helperText={errors.street}
                />
                <TextField
                  label="House Nr, floor"
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  fullWidth
                  className="full-width"
                />
              </>
            )}
          </Box>

          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            sx={{ mt: 3 }}
            disabled={isLoading}
          >
            {isLoading ? "Registering..." : "Sign Up"}
          </Button>
        </form>
      </Box>
    
  );
}
