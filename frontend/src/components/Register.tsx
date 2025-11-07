import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { TextField, MenuItem, Box, Autocomplete } from "@mui/material";
import countries from "world-countries";
import usePostData from "@hook/fetchData";
import { useAuth } from "@context/AuthContext.tsx";
import FormTemplate from "@components/common/FormTemplate.tsx";
import FormValidator from "@utils/UserFormValidator";
import type { User } from "@interfaces/User.tsx";
import type { Artist } from "@interfaces/Artist";
import type { Address } from "@interfaces/Address.tsx";
import { API_CONFIG } from "../config.tsx";

const countryList = countries.map((c) => c.name.common).sort();
const submitUrl = `${API_CONFIG.baseURL}/auth/register`;

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
    address1: "",
    address2: "",
    bio: "",
    style: "",
    imageUrl: "", // optional field
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
    const fieldsToValidate =
      form.accountType === "artist" 
        ? ["firstName", "lastName", "email", "password", "rePassword", "bio", "style"]
        : [ "firstName", "lastName", "email", "password", "rePassword", "mobileNr", "country","postalCode","city","address1"];

    const newErrors: { [key: string]: string } = {};
    fieldsToValidate.forEach((field) => {
      const error = FormValidator.validateField(field, form[field as keyof typeof form], form);
      if (error) newErrors[field] = error;
    });

    setErrors(newErrors);
    if (Object.values(newErrors).some(Boolean)) return;

    setError(""); // clear previous API errors

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
              imageUrl: form.imageUrl || "", // optional
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
              address1: form.address1,
              address2: form.address2,
            }
          : null,
    };

    console.log("Sending request with payload:", payload);

    const options: RequestInit = {
      method: "POST",
      mode: "cors",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    };

    sendRequest(options, "Registration failed. Please try again.");
  };

  useEffect(() => {
    if (status === 200 && data?.success) {
      login(form.email);
      navigate("/login");
    }
  }, [status, data, login, form.email, navigate]);

  return (
    <FormTemplate
      title="Create Account"
      onSubmit={handleSignUp}
      loading={isLoading}
      error={apiError || ""}
      submitLabel={isLoading ? "Registering..." : "Sign Up"}
      disableSubmit= {form.accountType === "artist"
                                                  ? (
                                                      !form.firstName ||
                                                      !form.lastName ||
                                                      !form.email ||
                                                      !form.password ||
                                                      !form.rePassword ||
                                                      !form.bio ||
                                                      !form.style
                                                      // imageUrl is optional
                                                    )
                                                  : (
                                                      !form.firstName ||
                                                      !form.lastName ||
                                                      !form.email ||
                                                      !form.password ||
                                                      !form.rePassword ||
                                                      !form.mobileNr ||
                                                      !form.country ||
                                                      !form.postalCode ||
                                                      !form.city ||
                                                      !form.address1
                                                      // address2 is optional
                                                    )}
    >
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
          gap: 1.5, // reduces space between inputs
          '& .MuiTextField-root': {
            margin: 0.5, // remove extra margin inside textfields
          },
        }}
      >
        {/* Basic user fields */}
        <TextField
          fullWidth
          label="First Name"
          name="firstName"
          value={form.firstName}
          onChange={handleChange}
          onBlur={onBlur("firstName")}
          error={!!errors.firstName}
          helperText={errors.firstName}
          size="small"
          margin="dense"
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
          size="small"
          margin="dense"
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
          size="small"
          margin="dense"
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
          size="small"
          margin="dense"
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
          size="small"
          margin="dense"
        />
        <TextField
          select
          label="Account Type"
          name="accountType"
          value={form.accountType}
          onChange={handleChange}
          sx={{ gridColumn: "1 / -1" }}
          size="small"
          margin="dense"
        >
          <MenuItem value="customer">Customer</MenuItem>
          <MenuItem value="artist">Artist</MenuItem>
        </TextField>

        {/* Artist-specific fields */}
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
              size="small"
              margin="dense"
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
              size="small"
              margin="dense"
            />
            <TextField
              fullWidth
              label="Profile Image URL (optional)"
              name="imageUrl"
              value={form.imageUrl}
              onChange={handleChange}
              sx={{ gridColumn: "1 / -1" }}
              size="small"
              margin="dense"
            />
            {form.imageUrl && (
              <Box sx={{ gridColumn: "1 / -1" }}>
                <img
                  src={form.imageUrl}
                  alt="Profile Preview"
                  style={{ width: "120px", borderRadius: "8px", marginTop: "8px" }}
                />
              </Box>
            )}
          </>
        )}

        {/* Customer-specific fields */}
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
              size="small"
              margin="dense"
            />
            <Autocomplete
              options={countryList}
              value={form.country}
              onChange={(_, value) =>
                setForm((prev) => ({ ...prev, country: value || "" }))
              }
              renderInput={(params) => <TextField {...params} 
                                          label="Country" 
                                          fullWidth 
                                          size="small"
                                          margin="dense"
                                       />}
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
              size="small"
              margin="dense"
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
              size="small"
              margin="dense"
            />
            <TextField
              fullWidth
              label="Address1"
              name="address1"
              value={form.address1}
              onChange={handleChange}
              onBlur={onBlur("address1")}
              error={!!errors.address1}
              helperText={errors.address1}
              size="small"
              margin="dense"
            />
            <TextField
              fullWidth
              label="Address2 (optional)"
              name="address2"
              value={form.address2}
              onChange={handleChange}
              size="small"
              margin="dense"
            />
          </>
        )}
      </Box>
    </FormTemplate>
  );
}
