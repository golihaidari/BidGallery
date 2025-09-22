import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Box, TextField, Button, Typography } from "@mui/material";
import useFetch from "@hook/fetchData";
import "./Login.css";
import { useAuth } from "@context/AuthContext.tsx";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth(); // use authContext to save user token and email.

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const { sendRequest, data, isLoading, error: fetchError, status, setError } = useFetch<{ success: boolean; message?: string }>("/api/login");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    navigate("/");
    
    if (!email || !password) {
      setError("Please enter both email and password");
      return;
    }

    /*
    sendRequest(
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      },
      "Login failed. Please try again."
    );*/
    
  };

  useEffect(() => {
    // Login successful
    if (status === 200 && data?.success) {
      // Use token returned from backend
      login( email, data.message!);

      navigate("/");
    } else if (status && !data?.success) {
      setError(data?.message || "Invalid email or password");
    }
  }, [status, data, navigate, setError]);

  const handleRegister = () => {
    navigate("/register");
  };

  return (
      <Box className="login-box">
        <Typography variant="h5" component="h1" gutterBottom>
          Welcome Back
        </Typography>
        <Typography variant="body2" color="textSecondary" gutterBottom>
          Please log in to continue
        </Typography>

        <form onSubmit={handleLogin}>
          <TextField
            label="Email"
            variant="outlined"
            fullWidth
            margin="normal"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            label="Password"
            type="password"
            variant="outlined"
            fullWidth
            margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {(fetchError) && (
            <Typography color="error" variant="body2" sx={{ mt: 1 }}>
              {fetchError}
            </Typography>
          )}

          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            sx={{ mt: 2 }}
            disabled={isLoading}
          >
            {isLoading ? "Logging in..." : "Log in"}
          </Button>
        </form>

        <Button
          variant="outlined"
          color="inherit"
          fullWidth
          sx={{ mt: 1 }}
          onClick={handleRegister}
        >
          Create Account
        </Button>
      </Box>
    
  );
}
