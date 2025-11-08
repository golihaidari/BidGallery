import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { TextField, Typography, Button, Box } from "@mui/material";
import { useAuth } from "@context/AuthContext.tsx";
import useFetch from "@hook/fetchData";
import FormTemplate from "@components/common/FormTemplate.tsx";
import FormValidator from "@utils/UserFormValidator";

import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "../firebase/firebase.tsx";
import { API_CONFIG } from "../config.tsx";

interface LoginResponse {
  success: boolean;
  email?: string;
  message?: string;
  requestId: string;
}

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [apiError, setApiError] = useState("");

  // -----------------------------
  // useFetch hooks
  // -----------------------------
  const {
    sendRequest: sendLoginRequest,
    data: loginData,
    isLoading: loginLoading,
    error: loginError,
    status: loginStatus,
  } = useFetch<LoginResponse>(`${API_CONFIG.baseURL}/auth/login`);

  const {
    sendRequest: sendGoogleRequest,
    data: googleData,
    isLoading: googleLoading,
    error: googleError,
    status: googleStatus,
  } = useFetch<LoginResponse>(`${API_CONFIG.baseURL}/auth/login/firebase`);

  // -----------------------------
  // Email/password login
  // -----------------------------
  const handleLogin = () => {
    const fieldErrors = {
      email: FormValidator.validateField("email", email),
      password: FormValidator.validateField("password", password),
    };
    setErrors(fieldErrors);
    if (Object.values(fieldErrors).some(Boolean)) return;

    setApiError("");
    sendLoginRequest(
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        credentials: "include",
      },
      "Login failed. Please try again."
    );
  };

  // -----------------------------
  // Google login
  // -----------------------------
  const handleGoogleLogin = async () => {
    setApiError("");
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const idToken = await result.user.getIdToken();

      await sendGoogleRequest(
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token: idToken }),
          credentials: "include",
        },
        "Google login failed."
      );
    } catch (err: unknown) {
      setApiError(err instanceof Error ? err.message : "Unknown error");
    }
  };

  // -----------------------------
  // Redirect after successful login
  // -----------------------------
  useEffect(() => {
    const successfulLogin =
      (loginStatus === 200 && loginData?.success && loginData.email) ||
      (googleStatus === 200 && googleData?.success && googleData.email);

    if (successfulLogin) {
      const userEmail = loginData?.email || googleData?.email!;
      //console.log("Logged in user email:", userEmail);
      login(userEmail); // save in context
      navigate("/"); // redirect after login
    }
  }, [loginStatus, loginData, googleStatus, googleData, login, navigate]);

  return (
    <FormTemplate
      title="Welcome Back"
      onSubmit={(e) => { e.preventDefault(); handleLogin(); }}
      loading={loginLoading || googleLoading}
      error={apiError || loginError || googleError || ""}
      submitLabel="Login"
      disableSubmit={!email || !password}
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

      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}> 
        <TextField
          fullWidth
          label="Email"
          type ="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onBlur={() => setErrors({ ...errors, email: FormValidator.validateField("email", email) })}
          error={!!errors.email}
          helperText={errors.email}
          size="small"
          margin="dense"
        />

        <TextField
          fullWidth
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onBlur={() => setErrors({ ...errors, password: FormValidator.validateField("password", password) })}
          error={!!errors.password}
          helperText={errors.password}
          size="small"
          margin="dense"
        />
      </Box>

      <Typography variant="body2" sx={{ mt: 2, textAlign: "center" }}>
        Don&apos;t have an account?{" "}
        <Typography
          component="span"
          onClick={() => navigate("/register")}
          sx={{
            color: "var(--text-secondary)",
            cursor: "pointer",
            fontWeight: 600,
            textDecoration: "underline",
            textUnderlineOffset: "3px",
            "&:hover": { color: "var(--button-secondary)", textDecorationColor: "var(--button-secondary)" },
          }}
        >
          Create account here
        </Typography>
      </Typography>
    </FormTemplate>
  );
}
