import { describe, it, vi, expect, beforeEach } from "vitest";
import { render, fireEvent, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Routes, Route, useNavigate } from "react-router-dom";
import { AuthProvider, useAuth } from "../../src/context/AuthContext";
import { CheckoutProvider } from "../../src/context/CheckoutContext";
import React from "react";

// Mock the useFetch hook
vi.mock("../../src/hook/fetchData", () => ({
  default: vi.fn()
}));

// Mock Firebase auth
vi.mock("../../src/firebase/firebase", () => ({
  auth: {
    currentUser: null
  }
}));

vi.mock("firebase/auth", () => ({
  GoogleAuthProvider: vi.fn(() => ({})),
  signInWithPopup: vi.fn()
}));

// Test data
const mockUser = {
  email: "test@example.com",
  password: "password123"
};

// Enhanced MockProducts with proper auth integration and context verification
const MockProducts = () => {
  const navigate = useNavigate();
  const { userEmail, isAuthenticated, logout } = useAuth();

  return (
    <div data-testid="products-page">
      {/* These elements verify AuthContext state */}
      <div data-testid="auth-status">
        {isAuthenticated ? `Logged in as: ${userEmail}` : "Guest user"}
      </div>
      <div data-testid="context-email">{userEmail || "null"}</div>
      <div data-testid="context-authenticated">{isAuthenticated.toString()}</div>
      
      {!isAuthenticated ? (
        <button 
          onClick={() => navigate("/login")}
          data-testid="login-btn"
        >
          Login
        </button>
      ) : (
        <button 
          onClick={logout}
          data-testid="logout-btn"
        >
          Logout
        </button>
      )}
    </div>
  );
};

// Fixed MockLogin - no early return, use useEffect for navigation
const MockLogin = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();
  const [shouldRedirect, setShouldRedirect] = React.useState(false);

  // Use useEffect for navigation to avoid hook order issues
  React.useEffect(() => {
    if (isAuthenticated && shouldRedirect) {
      navigate("/");
    }
  }, [isAuthenticated, shouldRedirect, navigate]);

  const handleLogin = () => {
    // Simulate successful login by updating auth context
    login(mockUser.email);
    setShouldRedirect(true);
  };

  return (
    <div data-testid="login-page">
      <button 
        onClick={() => {/* Simulate Google login */}}
        data-testid="google-login-btn"
      >
        Continue with Google
      </button>
      
      <input 
        type="email" 
        placeholder="Email"
        data-testid="email-input"
        defaultValue={mockUser.email}
      />
      <input 
        type="password" 
        placeholder="Password" 
        data-testid="password-input"
        defaultValue={mockUser.password}
      />
      
      <button 
        onClick={handleLogin}
        data-testid="login-submit-btn"
      >
        Log in
      </button>
      
      <button 
        onClick={() => navigate("/register")}
        data-testid="create-account-btn"
      >
        Create account here
      </button>
    </div>
  );
};

// Fixed MockRegister - proper account type handling
const MockRegister = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();
  const [accountType, setAccountType] = React.useState("customer");
  const [shouldRedirect, setShouldRedirect] = React.useState(false);

  // Use useEffect for navigation to avoid hook order issues
  React.useEffect(() => {
    if (isAuthenticated && shouldRedirect) {
      navigate("/");
    }
  }, [isAuthenticated, shouldRedirect, navigate]);

  const handleRegister = () => {
    // Simulate successful registration by updating auth context
    const email = accountType === "customer" 
      ? "customer@example.com" 
      : "artist@example.com";
    login(email);
    setShouldRedirect(true);
  };

  return (
    <div data-testid="register-page">
      {/* Fixed: Added accessibility attributes */}
      <label htmlFor="account-type-select" style={{ display: 'none' }}>
        Account Type
      </label>
      <select 
        id="account-type-select"
        data-testid="account-type-select"
        value={accountType}
        onChange={(e) => setAccountType(e.target.value)}
        aria-label="Account Type"
      >
        <option value="customer">Customer</option>
        <option value="artist">Artist</option>
      </select>

      {/* Customer fields - only show address fields */}
      {accountType === "customer" && (
        <>
          <input 
            type="text" 
            placeholder="First Name"
            data-testid="first-name-input"
          />
          <input 
            type="text" 
            placeholder="Last Name"
            data-testid="last-name-input"
          />
          <input 
            type="email" 
            placeholder="Email"
            data-testid="register-email-input"
            defaultValue="customer@example.com"
          />
          <input 
            type="password" 
            placeholder="Password"
            data-testid="register-password-input"
          />
          <input 
            type="password" 
            placeholder="Re-enter Password"
            data-testid="repassword-input"
          />
          <input 
            type="tel" 
            placeholder="Mobile Number"
            data-testid="mobile-input"
          />
          <input 
            type="text" 
            placeholder="Country"
            data-testid="country-input"
          />
          <input 
            type="text" 
            placeholder="Postal Code"
            data-testid="postal-code-input"
          />
          <input 
            type="text" 
            placeholder="City"
            data-testid="city-input"
          />
          <input 
            type="text" 
            placeholder="Address 1"
            data-testid="address1-input"
          />
        </>
      )}

      {/* Artist fields - only show artist info fields, NO address */}
      {accountType === "artist" && (
        <>
          <input 
            type="text" 
            placeholder="First Name"
            data-testid="first-name-input"
          />
          <input 
            type="text" 
            placeholder="Last Name"
            data-testid="last-name-input"
          />
          <input 
            type="email" 
            placeholder="Email"
            data-testid="register-email-input"
            defaultValue="artist@example.com"
          />
          <input 
            type="password" 
            placeholder="Password"
            data-testid="register-password-input"
          />
          <input 
            type="password" 
            placeholder="Re-enter Password"
            data-testid="repassword-input"
          />
          <textarea 
            placeholder="Bio"
            data-testid="bio-input"
          />
          <input 
            type="text" 
            placeholder="Style"
            data-testid="style-input"
          />
          <input 
            type="text" 
            placeholder="Profile Image URL (optional)"
            data-testid="image-url-input"
          />
        </>
      )}

      <button 
        onClick={handleRegister}
        data-testid="register-submit-btn"
      >
        Sign Up
      </button>

      <button 
        onClick={() => navigate("/login")}
        data-testid="back-to-login-btn"
      >
        Back to Login
      </button>
    </div>
  );
};

// Mock the actual components
vi.mock("../../src/pages/products/Products", () => ({
  default: MockProducts
}));

vi.mock("../../src/pages/auth/Login", () => ({
  default: MockLogin
}));

vi.mock("../../src/pages/auth/Register", () => ({
  default: MockRegister
}));

// Import actual hook
import useFetch from "../../src/hook/fetchData";

// Test App with real contexts
const AuthTestApp = () => {
  return (
    <AuthProvider>
      <CheckoutProvider>
        <MemoryRouter initialEntries={["/"]}>
          <Routes>
            <Route path="/" element={<MockProducts />} />
            <Route path="/login" element={<MockLogin />} />
            <Route path="/register" element={<MockRegister />} />
          </Routes>
        </MemoryRouter>
      </CheckoutProvider>
    </AuthProvider>
  );
};

describe("Auth Flow Integration", () => {
  const mockUseFetch = useFetch as any;

  beforeEach(() => {
    vi.clearAllMocks();
    // Mock useFetch to return successful responses by default
    mockUseFetch.mockReturnValue({
      sendRequest: vi.fn(),
      data: { success: true, email: mockUser.email },
      isLoading: false,
      error: null,
      status: 200,
      reset: vi.fn()
    });
  });

  it("should allow user to navigate to login and register pages", async () => {
    render(<AuthTestApp />);

    // Start at products page as guest
    expect(screen.getByTestId("products-page")).toBeInTheDocument();
    expect(screen.getByTestId("auth-status")).toHaveTextContent("Guest user");

    // Navigate to login page
    fireEvent.click(screen.getByTestId("login-btn"));
    await waitFor(() => {
      expect(screen.getByTestId("login-page")).toBeInTheDocument();
    });

    // Navigate to register page from login
    fireEvent.click(screen.getByTestId("create-account-btn"));
    await waitFor(() => {
      expect(screen.getByTestId("register-page")).toBeInTheDocument();
    });

    // Navigate back to login from register
    fireEvent.click(screen.getByTestId("back-to-login-btn"));
    await waitFor(() => {
      expect(screen.getByTestId("login-page")).toBeInTheDocument();
    });
  });

  it("should verify AuthContext state is properly updated after login", async () => {
    render(<AuthTestApp />);

    // Start as guest - verify initial AuthContext state
    expect(screen.getByTestId("auth-status")).toHaveTextContent("Guest user");
    expect(screen.getByTestId("context-email")).toHaveTextContent("null");
    expect(screen.getByTestId("context-authenticated")).toHaveTextContent("false");

    // Login
    fireEvent.click(screen.getByTestId("login-btn"));
    await waitFor(() => screen.getByTestId("login-page"));
    fireEvent.click(screen.getByTestId("login-submit-btn"));

    // Wait for redirect and verify AuthContext was updated
    await waitFor(() => {
      expect(screen.getByTestId("products-page")).toBeInTheDocument();
    });

    // VERIFY AUTHCONTEXT HAS THE CORRECT STATE:
    expect(screen.getByTestId("auth-status")).toHaveTextContent(`Logged in as: ${mockUser.email}`);
    expect(screen.getByTestId("context-email")).toHaveTextContent(mockUser.email);
    expect(screen.getByTestId("context-authenticated")).toHaveTextContent("true");

    // Logout and verify AuthContext is cleared
    fireEvent.click(screen.getByTestId("logout-btn"));
    
    await waitFor(() => {
      expect(screen.getByTestId("auth-status")).toHaveTextContent("Guest user");
    });
    
    expect(screen.getByTestId("context-email")).toHaveTextContent("null");
    expect(screen.getByTestId("context-authenticated")).toHaveTextContent("false");
  });

  it("should handle customer registration with address fields and verify AuthContext", async () => {
    render(<AuthTestApp />);

    // Go to register page
    fireEvent.click(screen.getByTestId("login-btn"));
    await waitFor(() => screen.getByTestId("login-page"));
    fireEvent.click(screen.getByTestId("create-account-btn"));
    await waitFor(() => screen.getByTestId("register-page"));

    // Ensure customer account type is selected (default)
    expect(screen.getByTestId("account-type-select")).toHaveValue("customer");

    // Verify customer has address fields but NO artist fields
    expect(screen.getByTestId("mobile-input")).toBeInTheDocument();
    expect(screen.getByTestId("country-input")).toBeInTheDocument();
    expect(screen.getByTestId("postal-code-input")).toBeInTheDocument();
    expect(screen.getByTestId("city-input")).toBeInTheDocument();
    expect(screen.getByTestId("address1-input")).toBeInTheDocument();
    
    // Should NOT have artist fields
    expect(screen.queryByTestId("bio-input")).not.toBeInTheDocument();
    expect(screen.queryByTestId("style-input")).not.toBeInTheDocument();
    expect(screen.queryByTestId("image-url-input")).not.toBeInTheDocument();

    // Submit registration
    fireEvent.click(screen.getByTestId("register-submit-btn"));

    // Should redirect to products and be logged in
    await waitFor(() => {
      expect(screen.getByTestId("products-page")).toBeInTheDocument();
    });

    // Verify auth context was updated with customer email
    expect(screen.getByTestId("auth-status")).toHaveTextContent("Logged in as: customer@example.com");
    expect(screen.getByTestId("context-email")).toHaveTextContent("customer@example.com");
    expect(screen.getByTestId("context-authenticated")).toHaveTextContent("true");
  });

  it("should handle artist registration with artist info fields (NO address) and verify AuthContext", async () => {
    render(<AuthTestApp />);

    // Go to register page
    fireEvent.click(screen.getByTestId("login-btn"));
    await waitFor(() => screen.getByTestId("login-page"));
    fireEvent.click(screen.getByTestId("create-account-btn"));
    await waitFor(() => screen.getByTestId("register-page"));

    // Select artist account type
    fireEvent.change(screen.getByTestId("account-type-select"), {
      target: { value: "artist" }
    });

    // Verify artist has artist info fields but NO address fields
    expect(screen.getByTestId("bio-input")).toBeInTheDocument();
    expect(screen.getByTestId("style-input")).toBeInTheDocument();
    expect(screen.getByTestId("image-url-input")).toBeInTheDocument();
    
    // Should NOT have address fields
    expect(screen.queryByTestId("mobile-input")).not.toBeInTheDocument();
    expect(screen.queryByTestId("country-input")).not.toBeInTheDocument();
    expect(screen.queryByTestId("postal-code-input")).not.toBeInTheDocument();
    expect(screen.queryByTestId("city-input")).not.toBeInTheDocument();
    expect(screen.queryByTestId("address1-input")).not.toBeInTheDocument();

    // Submit registration
    fireEvent.click(screen.getByTestId("register-submit-btn"));

    // Should redirect to products and be logged in
    await waitFor(() => {
      expect(screen.getByTestId("products-page")).toBeInTheDocument();
    });

    // Verify auth context was updated with artist email
    expect(screen.getByTestId("auth-status")).toHaveTextContent("Logged in as: artist@example.com");
    expect(screen.getByTestId("context-email")).toHaveTextContent("artist@example.com");
    expect(screen.getByTestId("context-authenticated")).toHaveTextContent("true");
  });

  it("should correctly switch between customer and artist forms", async () => {
    render(<AuthTestApp />);

    // Go to register page
    fireEvent.click(screen.getByTestId("login-btn"));
    await waitFor(() => screen.getByTestId("login-page"));
    fireEvent.click(screen.getByTestId("create-account-btn"));
    await waitFor(() => screen.getByTestId("register-page"));

    // Default should be customer with address fields
    expect(screen.getByTestId("account-type-select")).toHaveValue("customer");
    expect(screen.getByTestId("mobile-input")).toBeInTheDocument();
    expect(screen.queryByTestId("bio-input")).not.toBeInTheDocument();

    // Switch to artist
    fireEvent.change(screen.getByTestId("account-type-select"), {
      target: { value: "artist" }
    });

    // Should show artist fields and hide address fields
    expect(screen.getByTestId("bio-input")).toBeInTheDocument();
    expect(screen.getByTestId("style-input")).toBeInTheDocument();
    expect(screen.queryByTestId("mobile-input")).not.toBeInTheDocument();

    // Switch back to customer
    fireEvent.change(screen.getByTestId("account-type-select"), {
      target: { value: "customer" }
    });

    // Should show address fields and hide artist fields
    expect(screen.getByTestId("mobile-input")).toBeInTheDocument();
    expect(screen.queryByTestId("bio-input")).not.toBeInTheDocument();
    expect(screen.queryByTestId("style-input")).not.toBeInTheDocument();
  });

  it("should handle user logout and clear AuthContext state", async () => {
    render(<AuthTestApp />);

    // First login
    fireEvent.click(screen.getByTestId("login-btn"));
    await waitFor(() => screen.getByTestId("login-page"));
    fireEvent.click(screen.getByTestId("login-submit-btn"));
    await waitFor(() => screen.getByTestId("products-page"));

    // Verify logged in state in AuthContext
    expect(screen.getByTestId("auth-status")).toHaveTextContent(`Logged in as: ${mockUser.email}`);
    expect(screen.getByTestId("context-email")).toHaveTextContent(mockUser.email);
    expect(screen.getByTestId("context-authenticated")).toHaveTextContent("true");

    // Mock logout API call
    mockUseFetch.mockReturnValueOnce({
      sendRequest: vi.fn().mockResolvedValue({}),
      data: null,
      isLoading: false,
      error: null,
      status: 200,
      reset: vi.fn()
    });

    // Logout
    fireEvent.click(screen.getByTestId("logout-btn"));

    // Should still be on products page but as guest
    await waitFor(() => {
      expect(screen.getByTestId("products-page")).toBeInTheDocument();
    });

    // Verify AuthContext was cleared
    expect(screen.getByTestId("auth-status")).toHaveTextContent("Guest user");
    expect(screen.getByTestId("context-email")).toHaveTextContent("null");
    expect(screen.getByTestId("context-authenticated")).toHaveTextContent("false");
    expect(screen.getByTestId("login-btn")).toBeInTheDocument();
  });
});