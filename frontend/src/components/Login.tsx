import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { TextField, Typography } from "@mui/material";
import FormTemplate from "../utils/FormTemplate";
import { useAuth } from "@context/AuthContext.tsx";
import useFetch from "@hook/fetchData";
import FormValidator from "@utils/UserFormValidator";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const { sendRequest, data, isLoading, error: apiError, status, setError } =
    useFetch<{ success: boolean; message?: string }>("/api/login");

  // Validate on blur
  const onBlur = (field: "email" | "password") => (e: React.FocusEvent<HTMLInputElement>) => {
    const error = FormValidator.validateField(field, e.target.value, { password });
    setErrors((prev) => ({ ...prev, [field]: error }));
  };

  const handleRegister = () =>{
    navigate("/register");
  }
  const handleLogin = () => {
    // Validate all fields before sending
    const fieldErrors = {
      email: FormValidator.validateField("email", email),
      password: FormValidator.validateField("password", password),
    };
    setErrors(fieldErrors);

    if (Object.values(fieldErrors).some(Boolean)) return;

    setError("");

    const options: RequestInit = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
      mode: "cors", // explicitly added
    };

    sendRequest(options, "Login failed. Please try again.");
  };

  useEffect(() => {
    if (status === 200 && data?.success) {
      login(email, data.message!);
      navigate("/");
    } 
  }, [status, data, login, email, navigate, setError]);

  return (
    <FormTemplate
      title="Welcome Back"
      onSubmit={handleLogin}
      loading={isLoading}
      error={apiError || ""}
      submitLabel="Log in"
    >
      <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
        Please log in to continue
      </Typography>

      <TextField
        fullWidth
        label="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        onBlur={onBlur("email")}
        error={!!errors.email}
        helperText={errors.email}
        margin="normal"
      />

      <TextField
        fullWidth
        label="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        onBlur={onBlur("password")}
        error={!!errors.password}
        helperText={errors.password}
        margin="normal"
      />

      <Typography
        variant="body2"
        sx={{ mt: 2, textAlign: "center" }}
      >
        Don&apos;t have an account?{" "}
        <Typography
          component="span"
          onClick={handleRegister}
          sx={{
            color: "var(--text-secondary)",
            cursor: "pointer",
            fontWeight: 600,
            textDecoration: "underline",
            textUnderlineOffset: "3px",          // moves underline slightly away from text
            transition: "color 0.2s ease, text-decoration-color 0.2s ease",
            "&:hover": {
              color: "var(--button-secondary)",             // from your palette (#FFD97D)
              textDecorationColor: "var(--button-secondary)" // underline takes the hover color too
            },
          }}
        >
          Create account here
        </Typography>
      </Typography>

    </FormTemplate>
  );
}
