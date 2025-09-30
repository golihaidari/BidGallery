import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { TextField, MenuItem, Box, Autocomplete } from "@mui/material";
import countries from "world-countries";
import usePostData from "@hook/fetchData";
import { useAuth } from "@context/AuthContext.tsx";
import FormTemplate from "@utils/FormTemplate";
import FormValidator from "@utils/UserFormValidator";
import type { User } from "@interfaces/models/User";
import type { Artist } from "@interfaces/models/Artist";
import type { Address } from "@interfaces/models/Address";

const countryList = countries.map((c) => c.name.common).sort();
const submitUrl = "api/registerUser";

export default function Register() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const { sendRequest, data, isLoading, error: apiError, status, setError } =
    usePostData<{ success: boolean; message?: string }>(submitUrl);

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

  const onBlur = (field: string) => (e: React.FocusEvent<HTMLInputElement>) => {
    const error = FormValidator.validateField(field, e.target.value, form);
    setErrors((prev) => ({ ...prev, [field]: error }));
  };

  const handleSignUp = () => {
    // determine which fields to validate
    const fieldsToValidate = form.accountType === "artist"
      ? ["firstName", "lastName", "email", "password", "rePassword", "bio", "style"]
      : ["firstName", "lastName", "email", "password", "rePassword", "mobileNr", "country", "postalCode", "city", "street", "address"];

    const newErrors: { [key: string]: string } = {};

    fieldsToValidate.forEach((field) => {
      const error = FormValidator.validateField(field, form[field as keyof typeof form], form);
      if (error) newErrors[field] = error;
    });

    setErrors(newErrors);
    console.log("Validation errors:", newErrors);
    if (Object.values(newErrors).some(Boolean)) return;

    setError(""); // Clear previous API errors before sending
    
    const payload: { user: User; artist?: Artist | null; address?: Address | null } = {
      user: {
        email: form.email,
        password: form.password,
        accountType: form.accountType as "customer" | "artist",
      },
      artist:
        form.accountType === "artist"
          ? {
              firstName: form.firstName,
              lastName: form.lastName,
              bio: form.bio,
              style: form.style,
            }
          : null,
      address:
        form.accountType === "customer"
          ? {
              firstName: form.firstName,
              lastName: form.lastName,
              email: form.email,
              mobileNr: form.mobileNr,
              country: form.country,
              postalCode: form.postalCode,
              city: form.city,
              street: form.street,
              address: form.address,
            }
          : null,
    };
    console.log("Sending request with payload:", payload);

    const options: RequestInit = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      mode: "cors", 
    };

    sendRequest(options, "Registration failed. Please try again.");
  };

  useEffect(() => {
    if (status === 200 && data?.success) {
      login(form.email);
      navigate("/");
    }
  }, [status, data, login, form.email, navigate]);

  return (
    <FormTemplate
      title="Create Account"
      onSubmit={handleSignUp}
      loading={isLoading}
      error={apiError || ""}
      submitLabel={isLoading ? "Registering..." : "Sign Up"}
    >
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
          gap: 3,
        }}
      >
        <TextField
          fullWidth
          label="First Name"
          name="firstName"
          value={form.firstName}
          onChange={handleChange}
          onBlur={onBlur("firstName")}
          error={!!errors.firstName}
          helperText={errors.firstName}
        />
        <TextField
          fullWidth
          label="Last Name"
          name="lastName"
          value={form.lastName}
          onChange={handleChange}
          onBlur={onBlur("lastName")}
          error={!!errors.lastName}
          helperText={errors.lastName}
        />
        <TextField
          fullWidth
          label="Email"
          name="email"
          value={form.email}
          onChange={handleChange}
          onBlur={onBlur("email")}
          error={!!errors.email}
          helperText={errors.email}
          sx={{ gridColumn: "1 / -1" }}
        />
        <TextField
          fullWidth
          label="Password"
          type="password"
          name="password"
          value={form.password}
          onChange={handleChange}
          onBlur={onBlur("password")}
          error={!!errors.password}
          helperText={errors.password}
        />
        <TextField
          fullWidth
          label="Re-enter Password"
          type="password"
          name="rePassword"
          value={form.rePassword}
          onChange={handleChange}
          onBlur={onBlur("rePassword")}
          error={!!errors.rePassword}
          helperText={errors.rePassword}
        />
        <TextField
          select
          label="Account Type"
          name="accountType"
          value={form.accountType}
          onChange={handleChange}
          sx={{ gridColumn: "1 / -1" }}
        >
          <MenuItem value="customer">Customer</MenuItem>
          <MenuItem value="artist">Artist</MenuItem>
        </TextField>

        {form.accountType === "artist" && (
          <>
            <TextField
              fullWidth
              label="Style"
              name="style"
              value={form.style}
              onChange={handleChange}
              onBlur={onBlur("style")}
              error={!!errors.style}
              helperText={errors.style}
              sx={{ gridColumn: "1 / -1" }}
            />
            <TextField
              fullWidth
              label="Bio"
              name="bio"
              multiline
              rows={3}
              value={form.bio}
              onChange={handleChange}
              onBlur={onBlur("bio")}
              error={!!errors.bio}
              helperText={errors.bio}
              sx={{ gridColumn: "1 / -1" }}
            />
          </>
        )}

        {form.accountType === "customer" && (
          <>
            <TextField
              fullWidth
              label="Mobile Number"
              name="mobileNr"
              value={form.mobileNr}
              onChange={handleChange}
              onBlur={onBlur("mobileNr")}
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
              fullWidth
              label="Postal Code"
              name="postalCode"
              value={form.postalCode}
              onChange={handleChange}
              onBlur={onBlur("postalCode")}
              error={!!errors.postalCode}
              helperText={errors.postalCode}
            />
            <TextField
              fullWidth
              label="City"
              name="city"
              value={form.city}
              onChange={handleChange}
              onBlur={onBlur("city")}
              error={!!errors.city}
              helperText={errors.city}
            />
            <TextField
              fullWidth
              label="Street"
              name="street"
              value={form.street}
              onChange={handleChange}
              onBlur={onBlur("street")}
              error={!!errors.street}
              helperText={errors.street}
            />
            <TextField
              fullWidth
              label="House Nr, floor"
              name="address"
              value={form.address}
              onChange={handleChange}
            />
          </>
        )}
      </Box>
    </FormTemplate>
  );
}
