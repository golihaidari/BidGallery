// tests/integration/Login.integration.test.tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { AuthProvider } from "../../src/context/AuthContext"; // Import AuthProvider
import Login from "../../src/components/Login";

// Mock only external APIs
vi.mock("../../src/hook/fetchData", () => ({
  default: () => ({
    sendRequest: vi.fn(),
    setError: vi.fn(),
    isLoading: false,
    error: "",
  }),
}));

// Mock Firebase if needed
vi.mock("../../src/firebase/firebase", () => ({
  auth: {},
}));

describe("Login Component - Integration Tests", () => {
  const renderLogin = () => {
    return render(
      <MemoryRouter>
        <AuthProvider> {/* Wrap with AuthProvider */}
          <Login />
        </AuthProvider>
      </MemoryRouter>
    );
  };

  it("integrates with real validator for email validation", async () => {
    renderLogin();

    const emailInput = screen.getByLabelText(/email/i);
    fireEvent.change(emailInput, { target: { value: "invalid" } });
    fireEvent.blur(emailInput);

    await waitFor(() => {
      expect(screen.getByText(/please enter a valid email/i)).toBeInTheDocument();
    });
  });

  it("integrates with real validator for password validation", async () => {
    renderLogin();

    const passwordInput = screen.getByLabelText(/password/i);
    fireEvent.change(passwordInput, { target: { value: "short" } });
    fireEvent.blur(passwordInput);

    await waitFor(() => {
      expect(screen.getByText(/password must be at least 8 characters/i)).toBeInTheDocument();
    });
  });

  it("allows valid email and password", async () => {
    renderLogin();

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);

    fireEvent.change(emailInput, { target: { value: "valid@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "validpassword123" } });

    await waitFor(() => {
      expect(screen.queryByText(/please enter a valid email/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/password must be at least 8 characters/i)).not.toBeInTheDocument();
    });
  });
});