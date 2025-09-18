import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, TextField, Button, Typography } from "@mui/material";
import "./Login.css";

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = () => {
    if (!email || !password) {
      setError("Please enter both email and password");
      return;
    }

    if (email === "a" && password === "1") {
      setError("Invalid email or password");
    } else {
      navigate("/products");
    }
  };

  const handleRegister = () => {
    navigate("/register");
  };

  return (
    <Box className="login-container">
      <Box className="login-box">
        <Typography variant="h5" component="h1" gutterBottom>
          Welcome Back
        </Typography>
        <Typography variant="body2" color="textSecondary" gutterBottom>
          Please log in to continue
        </Typography>

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

        {error && (
          <Typography color="error" variant="body2" sx={{ mt: 1 }}>
            {error}
          </Typography>
        )}

        <Button
          variant="contained"
          color="primary"
          fullWidth
          sx={{ mt: 2 }}
          onClick={handleLogin}
        >
          Log in
        </Button>
        <Button
          variant="outlined"
          color="inherit"
          fullWidth
          sx={{ mt: 1 }}
          onClick={handleRegister}
        >
          Sign up
        </Button>
      </Box>
    </Box>
  );
}

export default Login;
