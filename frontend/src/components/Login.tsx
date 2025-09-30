import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { TextField, Typography, Button } from "@mui/material";
import FormTemplate from "../utils/FormTemplate";
import { useAuth } from "@context/AuthContext.tsx";
import useFetch from "@hook/fetchData";
import FormValidator from "@utils/UserFormValidator";

import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "../../src/firebase/firebase";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const { sendRequest, data, isLoading, error: apiError, status, setError } =
    useFetch<{ success: boolean; email?: string }>("/api/login");

  // Validate fields on blur
  const onBlur = (field: "email" | "password") => (e: React.FocusEvent<HTMLInputElement>) => {
    const err = FormValidator.validateField(field, e.target.value, { password });
    setErrors((prev) => ({ ...prev, [field]: err }));
  };

  const handleRegister = () => navigate("/register");

  // Email/password login
  const handleLogin = () => {
    const fieldErrors = {
      email: FormValidator.validateField("email", email),
      password: FormValidator.validateField("password", password),
    };
    setErrors(fieldErrors);
    if (Object.values(fieldErrors).some(Boolean)) return;

    setError("");

    sendRequest(
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        credentials: "include", // important for HttpOnly cookie
      },
      "Login failed. Please try again."
    );
  };

  // Google login
  const handleGoogleLogin = async () => {
    setError("");
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const idToken = await result.user.getIdToken();
      console.log("Google ID Token:", idToken);

      // Send Google ID token to backend
     /* sendRequest(
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token: idToken }),
          credentials: "include",
        },
        "Google login failed."
      );*/
      login(email); // update AuthContext
      navigate("/");
      
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Handle successful login (email/password or Google)
  useEffect(() => {
    if (status === 200 && data?.success && data.email) {
      login(data.email); // update AuthContext
      navigate("/");
    }
  }, [status, data, login, navigate]);

  return (
    <FormTemplate
      title="Welcome Back"
      onSubmit={(e) => { e.preventDefault(); handleLogin(); }}
      loading={isLoading}
      error={apiError || ""}
      submitLabel="Log in"
    >
      <Button
        fullWidth
        variant="outlined"
        onClick={handleGoogleLogin}
        sx={{ color: "var(--text-secondary)", mb: 2 }}
      >
        Continue with Google
      </Button>

      <Typography variant="body2" color="textSecondary" sx={{ mt: 2, mb: 1, textAlign: "center" }}>
        ________ or sign in ________
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

      <Typography variant="body2" sx={{ mt: 2, textAlign: "center" }}>
        Don&apos;t have an account?{" "}
        <Typography
          component="span"
          onClick={handleRegister}
          sx={{
            color: "var(--text-secondary)",
            cursor: "pointer",
            fontWeight: 600,
            textDecoration: "underline",
            textUnderlineOffset: "3px",
            "&:hover": {
              color: "var(--button-secondary)",
              textDecorationColor: "var(--button-secondary)",
            },
          }}
        >
          Create account here
        </Typography>
      </Typography>
    </FormTemplate>
  );
}
