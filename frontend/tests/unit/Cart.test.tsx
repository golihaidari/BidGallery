import { describe, it, vi, expect, beforeEach } from "vitest";
import { render, fireEvent, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Cart from "../../src/components/Cart";

// Mock react-router-dom
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return { 
    ...actual, 
    useNavigate: () => mockNavigate 
  };
});

// Mock CheckoutContext - create a mock that we can override
const mockDispatch = vi.fn();
let mockCartState = {
  cart: [
    {
      product: {
        id: "1",
        title: "Test Product 1",
        imageUrl: "test1.jpg",
        currency: "USD"
      },
      bidPrice: 100
    },
    {
      product: {
        id: "2", 
        title: "Test Product 2",
        imageUrl: "test2.jpg",
        currency: "USD"
      },
      bidPrice: 150
    }
  ],
  address: null,
  paymentIntentId: ""
};

vi.mock("../../src/context/CheckoutContext", () => ({
  useCheckout: () => ({ 
    dispatch: mockDispatch,
    state: mockCartState
  }),
}));

// Mock FormTemplate
vi.mock("../../src/components/common/FormTemplate", () => ({
  default: ({ children, title, submitLabel, onSubmit }: any) => (
    <div data-testid="cart-form">
      <h1>{title}</h1>
      {children}
      <button onClick={onSubmit} data-testid="submit-btn">
        {submitLabel}
      </button>
    </div>
  ),
}));

// Mock GradientButton
vi.mock("../../src/components/common/GradientButton", () => ({
  default: ({ children, onClick, sx }: any) => (
    <button onClick={onClick} style={sx} data-testid="remove-btn">
      {children}
    </button>
  ),
}));

describe("Cart Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset to default cart state before each test
    mockCartState = {
      cart: [
        {
          product: {
            id: "1",
            title: "Test Product 1",
            imageUrl: "test1.jpg",
            currency: "USD"
          },
          bidPrice: 100
        },
        {
          product: {
            id: "2", 
            title: "Test Product 2",
            imageUrl: "test2.jpg",
            currency: "USD"
          },
          bidPrice: 150
        }
      ],
      address: null,
      paymentIntentId: ""
    };
  });

  it("renders cart with products and total", () => {
    render(
      <MemoryRouter>
        <Cart />
      </MemoryRouter>
    );

    expect(screen.getByText("Your Cart")).toBeInTheDocument();
    expect(screen.getByText("Test Product 1")).toBeInTheDocument();
    expect(screen.getByText("Test Product 2")).toBeInTheDocument();
    expect(screen.getByText("Bid: 100.00 USD")).toBeInTheDocument();
    expect(screen.getByText("Bid: 150.00 USD")).toBeInTheDocument();
    expect(screen.getByText("Total: 250.00 USD")).toBeInTheDocument();
    expect(screen.getByText("Proceed to Checkout")).toBeInTheDocument();
  });

  it("removes product when remove button is clicked", () => {
    render(
      <MemoryRouter>
        <Cart />
      </MemoryRouter>
    );

    const removeButtons = screen.getAllByTestId("remove-btn");
    fireEvent.click(removeButtons[0]); // Click first remove button

    expect(mockDispatch).toHaveBeenCalledWith({
      type: "REMOVE_FROM_CART",
      productId: "1"
    });
  });

  it("navigates to delivery when checkout is clicked with items in cart", () => {
    render(
      <MemoryRouter>
        <Cart />
      </MemoryRouter>
    );

    const checkoutButton = screen.getByTestId("submit-btn");
    fireEvent.click(checkoutButton);

    expect(mockNavigate).toHaveBeenCalledWith("/delivery");
  });

});