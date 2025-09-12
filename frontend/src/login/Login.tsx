import { useNavigate } from "react-router-dom";
import { useState } from "react";
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

    if (email === "test@example.com" && password === "1234") {
      navigate("/main");
    } else {
      setError("Invalid email or password");
    }
  };

  const handleRegister = () => {
    navigate("/register");
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h1 className="title">Welcome Back</h1>
        <p className="subtitle">Please log in to continue</p>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="input"
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="input"
        />

        {error && <p className="error">{error}</p>}

        <button className="btn primary" onClick={handleLogin}>
          Log in
        </button>
        <button className="btn secondary" onClick={handleRegister}>
          Sign up
        </button>
      </div>
    </div>
  );
}

export default Login;
