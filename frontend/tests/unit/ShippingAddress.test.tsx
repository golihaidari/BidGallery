import { describe, it, vi, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

// Minimal mocks
vi.mock("@hook/fetchData", () => ({
  default: () => ({
    sendRequest: vi.fn(),
    setError: vi.fn(),
    status: 200,
    data: null,
    isLoading: false,
    error: "",
    reset: vi.fn(),
  }),
}));

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return { ...actual, useNavigate: vi.fn() };
});

vi.mock("@context/CheckoutContext", () => ({
  useCheckout: () => ({ dispatch: vi.fn(), state: { address: null } }),
}));

// Add this simple auth mock
vi.mock("@context/AuthContext", () => ({
  useAuth: () => ({ 
    isAuthenticated: false 
  }),
}));

import ShippingAddress from "../../src/components/ShippingAddress";

describe("ShippingAddress", () => {
  it("renders the shipping form", () => {
    render(
      <MemoryRouter>
        <ShippingAddress />
      </MemoryRouter>
    );
    
    expect(screen.getByLabelText("First Name")).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Country")).toBeInTheDocument();
  });
});