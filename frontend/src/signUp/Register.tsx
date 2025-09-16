import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  TextField,
  Button,
  MenuItem,
  Card,
  CardContent,
  Typography,
  Box,
} from "@mui/material";
import "./Register.css";

type AccountType = "customer" | "artist";

interface FormState {
  firstName: string;
  surname: string;
  email: string;
  password: string;
  rePassword: string;
  accountType: AccountType;
  postalCode?: string;
  city?: string;
  address?: string;
  bio?: string;
  style?: string;
}

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState<FormState>({
    firstName: "",
    surname: "",
    email: "",
    password: "",
    rePassword: "",
    accountType: "customer",
    postalCode: "",
    city: "",
    address: "",
    bio: "",
    style: "",
  });

  const [error, setError] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSignUp = () => {
    if (!form.firstName || !form.surname || !form.email || !form.password || !form.rePassword) {
      setError("Please fill all required fields");
      return;
    }
    if (form.password !== form.rePassword) {
      setError("Passwords do not match");
      return;
    }
    if (form.accountType === "customer" && (!form.postalCode || !form.city || !form.address)) {
      setError("Please fill in all address fields");
      return;
    }
    if (form.accountType === "artist" && (!form.bio || !form.style)) {
      setError("Please fill in all artist details");
      return;
    }

    console.log("Form data:", form); // send this to backend
    navigate("/main");
  };

  return (
    <Box className="register-container">
      <Card className="register-card">
        <CardContent>
          <Typography variant="h5" component="h2" gutterBottom>
            Create Account
          </Typography>
          {error && <Typography color="error" gutterBottom>{error}</Typography>}

          <TextField
            fullWidth
            label="First Name"
            name="firstName"
            value={form.firstName}
            onChange={handleChange}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Surname"
            name="surname"
            value={form.surname}
            onChange={handleChange}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Email"
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Password"
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Re-enter Password"
            type="password"
            name="rePassword"
            value={form.rePassword}
            onChange={handleChange}
            margin="normal"
          />

          <TextField
            select
            fullWidth
            label="Account Type"
            name="accountType"
            value={form.accountType}
            onChange={handleChange}
            margin="normal"
          >
            <MenuItem value="customer">Customer</MenuItem>
            <MenuItem value="artist">Artist</MenuItem>
          </TextField>

          {form.accountType === "customer" && (
            <>
              <TextField
                fullWidth
                label="Postal Code"
                name="postalCode"
                value={form.postalCode}
                onChange={handleChange}
                margin="normal"
              />
              <TextField
                fullWidth
                label="City"
                name="city"
                value={form.city}
                onChange={handleChange}
                margin="normal"
              />
              <TextField
                fullWidth
                label="Address"
                name="address"
                value={form.address}
                onChange={handleChange}
                margin="normal"
              />
            </>
          )}

          {form.accountType === "artist" && (
            <>
              <TextField
                fullWidth
                label="Bio"
                name="bio"
                value={form.bio}
                onChange={handleChange}
                margin="normal"
                multiline
                rows={3}
              />
              <TextField
                fullWidth
                label="Style"
                name="style"
                value={form.style}
                onChange={handleChange}
                margin="normal"
              />
            </>
          )}

          <Button
            variant="contained"
            color="primary"
            fullWidth
            onClick={handleSignUp}
            style={{ marginTop: "16px" }}
          >
            Sign Up
          </Button>
        </CardContent>
      </Card>
    </Box>
  );
}
