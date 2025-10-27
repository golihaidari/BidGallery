import { describe, it, vi, expect, beforeEach } from "vitest";
import { render, fireEvent, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Bid from "../../src/components/Bid";

// Mock useFetch
const mockSendRequest = vi.fn();

vi.mock("@hook/fetchData", () => ({
  default: () => ({
    sendRequest: mockSendRequest,
    setError: vi.fn(),
    status: null,
    data: null,
    isLoading: false,
    error: null,
    reset: vi.fn(),
  }),
}));

// Mock react-router-dom
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => vi.fn(),
    useLocation: () => ({ 
      state: { 
        product: { 
          id: "1", 
          title: "Test Product", 
          secretPrice: 100,
          currency: "USD",
          imageUrl: "test.jpg",
          artistFirstName: "Anna",
          artistLastName: "Doe",
          style: "Abstract", 
          yearCreated: 2020,
          productSize: "50x50cm",
          dateAdded: "2025-10-19",
          description: "Test description",
          sold: 0
        } 
      } 
    }),
  };
});

// Mock CheckoutContext
vi.mock("@context/CheckoutContext", () => ({
  useCheckout: () => ({ 
    state: { cart: [] }, 
    dispatch: vi.fn() 
  }),
}));

describe("Bid Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders product and bid form", () => {
    render(
      <MemoryRouter>
        <Bid />
      </MemoryRouter>
    );
    
    expect(screen.getByText("Place your bid for: Test Product")).toBeInTheDocument();
    expect(screen.getByLabelText("Enter your bid")).toBeInTheDocument();
  });

  it("submits valid bid", async () => {
    render(
      <MemoryRouter>
        <Bid />
      </MemoryRouter>
    );
    
    fireEvent.change(screen.getByLabelText("Enter your bid"), { 
      target: { value: "150" } 
    });
    fireEvent.click(screen.getByText("Submit Bid"));

    await waitFor(() => {
      expect(mockSendRequest).toHaveBeenCalled();
    });
  });

  it("prevents submission with invalid bid", async () => {
    render(
      <MemoryRouter>
        <Bid />
      </MemoryRouter>
    );
    
    fireEvent.change(screen.getByLabelText("Enter your bid"), { 
      target: { value: "0" } 
    });
    fireEvent.click(screen.getByText("Submit Bid"));

    // Just test that API is not called - skip the error text check
    await waitFor(() => {
      expect(mockSendRequest).not.toHaveBeenCalled();
    });
  });
});