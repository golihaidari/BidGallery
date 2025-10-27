// checkout-integration.test.tsx
import { describe, it, vi, expect, beforeEach } from "vitest";
import { render, fireEvent, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { CheckoutProvider, useCheckout } from "../../src/context/CheckoutContext";
import { AuthProvider } from "../../src/context/AuthContext";

// Mock the useFetch hook
vi.mock("../../src/hook/fetchData", () => ({
  default: vi.fn()
}));

// Mock the createMockPaymentIntent utility
vi.mock("../../src/utils/createMockPaymentIntent", () => ({
  createMockPaymentIntent: vi.fn(() => ({
    paymentIntentId: "mock_payment_intent_123"
  }))
}));

// Test data
const mockProduct = {
  id: "1",
  title: "Test Painting",
  secretPrice: 100,
  currency: "USD",
  imageUrl: "test.jpg",
  sold: 0,
  description: "Test description",
  yearCreated: 2024,
  productSize: "20x30",
  dateAdded: "2024-01-01",
  artistFirstName: "Anna",
  artistLastName: "Larsen", 
  style: "Abstract"
};

const mockAddress = {
  firstName: "Anna",
  lastName: "Larsen",
  email: "anna@example.com", 
  mobileNr: "1234567890",
  country: "Denmark",
  postalCode: "1234",
  city: "Copenhagen",
  address1: "Test Street 123",
  address2: ""
};

// Enhanced MockProducts with CheckoutContext verification
const MockProducts = () => {
  const navigate = useNavigate();
  const { state } = useCheckout(); // Using real hook
  
  const handleBid = (product: any, e: React.FormEvent) => {
    e.preventDefault();
    navigate("/bid", { state: { product } });
  };

  return (
    <div data-testid="products-page">
      {/* VERIFY CHECKOUTCONTEXT STATE */}
      <div data-testid="cart-count">{state.cart.length}</div>
      <div data-testid="has-address">{state.address ? "yes" : "no"}</div>
      <div data-testid="payment-intent">{state.paymentIntentId || "none"}</div>
      
      <button 
        onClick={(e) => handleBid(mockProduct, e)}
        data-testid="select-product"
      >
        Select Test Product
      </button>
    </div>
  );
};

// Enhanced MockBid with proper context verification
const MockBid = () => {
  const navigate = useNavigate();
  const { state, dispatch } = useCheckout(); // Using real hook
  const location = useLocation();

  const selectedProduct = location.state?.product;

  const handleSubmit = () => {
    // Add to cart and verify context update
    dispatch({
      type: "ADD_TO_CART",
      item: { product: selectedProduct, bidPrice: 150 }
    });
    navigate("/cart");
  };

  if (!selectedProduct) {
    return <div data-testid="no-product">No product selected</div>;
  }

  return (
    <div data-testid="bid-page">
      <div data-testid="product-title">{selectedProduct.title}</div>
      {/* Show current cart state */}
      <div data-testid="current-cart-count">Current cart: {state.cart.length}</div>
      
      <button 
        onClick={handleSubmit}
        data-testid="submit-bid"
      >
        Submit Bid $150
      </button>
      <button onClick={() => navigate("/")} data-testid="back-to-products">
        Back to Products
      </button>
    </div>
  );
};

// Enhanced MockCart with comprehensive context verification
const MockCart = () => {
  const navigate = useNavigate();
  const { state, dispatch } = useCheckout(); // Using real hook

  const handleCheckout = () => {
    if (state.cart.length === 0) {
      navigate("/");
    } else {
      navigate("/shipping");
    }
  };

  const handleRemove = (productId: string) => {
    dispatch({ type: "REMOVE_FROM_CART", productId });
  };

  return (
    <div data-testid="cart-page">
      {/* COMPREHENSIVE CONTEXT VERIFICATION */}
      <div data-testid="cart-items-count">Items in cart: {state.cart.length}</div>
      <div data-testid="cart-total">Total: {state.cart.reduce((sum, item) => sum + item.bidPrice, 0)}</div>
      <div data-testid="cart-contents">
        {state.cart.map(item => item.product.title).join(", ")}
      </div>
      
      {state.cart.length === 0 ? (
        <div data-testid="empty-cart">Your cart is empty</div>
      ) : (
        state.cart.map((item) => (
          <div key={item.product.id} data-testid={`cart-item-${item.product.id}`}>
            {item.product.title} - ${item.bidPrice}
            <button 
              onClick={() => handleRemove(item.product.id)}
              data-testid={`remove-${item.product.id}`}
            >
              Remove
            </button>
          </div>
        ))
      )}

      <button 
        onClick={handleCheckout}
        data-testid="proceed-to-shipping"
      >
        {state.cart.length === 0 ? "Go Back to Products" : "Proceed to Checkout"}
      </button>
      <button onClick={() => navigate("/")} data-testid="back-to-products-from-cart">
        Back to Products
      </button>
    </div>
  );
};

// Enhanced MockShippingAddress with context verification
const MockShippingAddress = () => {
  const navigate = useNavigate();
  const { state, dispatch } = useCheckout(); // Using real hook

  const handleSubmit = () => {
    dispatch({
      type: "SET_ADDRESS",
      address: mockAddress
    });
    navigate("/payment");
  };

  return (
    <div data-testid="shipping-page">
      {/* Verify address state */}
      <div data-testid="current-address">
        {state.address ? "Address set" : "No address"}
      </div>
      
      <button 
        onClick={handleSubmit}
        data-testid="submit-address"
      >
        Submit Address
      </button>
      <button onClick={() => navigate("/cart")} data-testid="back-to-cart">
        Back to Cart
      </button>
    </div>
  );
};

// Enhanced MockPayment with context verification
const MockPayment = () => {
  const navigate = useNavigate();
  const { state, dispatch } = useCheckout(); // Using real hook

  const handlePaymentSuccess = () => {
    dispatch({
      type: "SET_PAYMENT_INTENT",
      paymentIntentId: "mock_payment_123"
    });
    navigate("/submit");
  };

  return (
    <div data-testid="payment-page">
      {/* Verify payment state */}
      <div data-testid="current-payment-intent">
        Payment: {state.paymentIntentId || "Not set"}
      </div>
      
      <button 
        onClick={handlePaymentSuccess}
        data-testid="submit-payment"
      >
        Submit Payment
      </button>
      <button onClick={() => navigate("/shipping")} data-testid="back-to-shipping">
        Back to Shipping
      </button>
    </div>
  );
};

// Enhanced MockSubmit with comprehensive context verification
const MockSubmit = () => {
  const navigate = useNavigate();
  const { state, dispatch } = useCheckout(); // Using real hook

  const handleSubmitOrder = () => {
    // Simulate successful order - reset context
    dispatch({ type: "RESET" });
    navigate("/success");
  };

  return (
    <div data-testid="submit-page">
      {/* COMPREHENSIVE CONTEXT VERIFICATION */}
      <div data-testid="order-summary">
        Products: {state.cart.length} | 
        Address: {state.address ? "Yes" : "No"} | 
        Payment: {state.paymentIntentId || "No"}
      </div>
      <div data-testid="final-cart-count">Final cart count: {state.cart.length}</div>
      <div data-testid="final-address">{state.address ? "Address present" : "No address"}</div>
      <div data-testid="final-payment">{state.paymentIntentId || "No payment"}</div>
      
      <button 
        onClick={handleSubmitOrder}
        data-testid="submit-order"
      >
        Place Order
      </button>
      <button onClick={() => navigate("/payment")} data-testid="back-to-payment">
        Back to Payment
      </button>
    </div>
  );
};

// Enhanced MockInfoCard with context verification after reset
const MockInfoCard = () => {
  const navigate = useNavigate();
  const { state } = useCheckout(); // Using real hook

  return (
    <div data-testid="info-card">
      {/* VERIFY CONTEXT WAS RESET AFTER ORDER */}
      <div data-testid="cart-after-order">Cart after order: {state.cart.length}</div>
      <div data-testid="address-after-order">Address after order: {state.address ? "yes" : "no"}</div>
      <div data-testid="payment-after-order">Payment after order: {state.paymentIntentId || "none"}</div>
      
      <button 
        onClick={() => navigate("/")}
        data-testid="continue-shopping"
      >
        Continue Shopping
      </button>
    </div>
  );
};

// Mock the actual components
vi.mock("../../src/pages/products/Products", () => ({
  default: MockProducts
}));

vi.mock("../../src/pages/checkout/Bid", () => ({
  default: MockBid
}));

vi.mock("../../src/pages/checkout/Cart", () => ({
  default: MockCart
}));

vi.mock("../../src/pages/checkout/ShippingAddress", () => ({
  default: MockShippingAddress
}));

vi.mock("../../src/pages/checkout/Payment", () => ({
  default: MockPayment
}));

vi.mock("../../src/pages/checkout/Submit", () => ({
  default: MockSubmit
}));

vi.mock("../../src/components/common/InfoCard/InfoCard", () => ({
  default: MockInfoCard
}));

// Import actual hook
import useFetch from "../../src/hook/fetchData";

// Test App with real contexts
const CheckoutTestApp = () => {
  return (
    <AuthProvider>
      <CheckoutProvider>
        <MemoryRouter initialEntries={["/"]}>
          <Routes>
            <Route path="/" element={<MockProducts />} />
            <Route path="/bid" element={<MockBid />} />
            <Route path="/cart" element={<MockCart />} />
            <Route path="/shipping" element={<MockShippingAddress />} />
            <Route path="/payment" element={<MockPayment />} />
            <Route path="/submit" element={<MockSubmit />} />
            <Route path="/success" element={<MockInfoCard />} />
          </Routes>
        </MemoryRouter>
      </CheckoutProvider>
    </AuthProvider>
  );
};

describe("Checkout Flow Integration with Context", () => {
  const mockUseFetch = useFetch as any;

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseFetch.mockReturnValue({
      sendRequest: vi.fn(),
      data: null,
      isLoading: false,
      error: null,
      status: 0,
      reset: vi.fn()
    });
  });

  it("should complete full checkout flow with proper CheckoutContext state management", async () => {
    render(<CheckoutTestApp />);

    // Step 1: Start at products - verify initial CheckoutContext state
    expect(screen.getByTestId("products-page")).toBeInTheDocument();
    expect(screen.getByTestId("cart-count")).toHaveTextContent("0");
    expect(screen.getByTestId("has-address")).toHaveTextContent("no");
    expect(screen.getByTestId("payment-intent")).toHaveTextContent("none");

    // Step 2: Select product and navigate to bid
    fireEvent.click(screen.getByTestId("select-product"));
    await waitFor(() => screen.getByTestId("bid-page"));
    expect(screen.getByTestId("product-title")).toHaveTextContent("Test Painting");

    // Step 3: Submit bid and navigate to cart - verify context updated
    expect(screen.getByTestId("current-cart-count")).toHaveTextContent("0");
    fireEvent.click(screen.getByTestId("submit-bid"));
    await waitFor(() => screen.getByTestId("cart-page"));

    // VERIFY CHECKOUTCONTEXT WAS UPDATED
    expect(screen.getByTestId("cart-items-count")).toHaveTextContent("1");
    expect(screen.getByTestId("cart-total")).toHaveTextContent("150");
    expect(screen.getByTestId("cart-contents")).toHaveTextContent("Test Painting");

    // Step 4: Proceed to shipping
    fireEvent.click(screen.getByTestId("proceed-to-shipping"));
    await waitFor(() => screen.getByTestId("shipping-page"));

    // Step 5: Submit address - verify context updated
    expect(screen.getByTestId("current-address")).toHaveTextContent("No address");
    fireEvent.click(screen.getByTestId("submit-address"));
    await waitFor(() => screen.getByTestId("payment-page"));

    // Step 6: Submit payment - verify context updated  
    expect(screen.getByTestId("current-payment-intent")).toHaveTextContent("Not set");
    fireEvent.click(screen.getByTestId("submit-payment"));
    await waitFor(() => screen.getByTestId("submit-page"));

    // VERIFY ALL CHECKOUTCONTEXT DATA IS PRESENT
    expect(screen.getByTestId("order-summary")).toHaveTextContent("Products: 1");
    expect(screen.getByTestId("order-summary")).toHaveTextContent("Address: Yes");
    expect(screen.getByTestId("order-summary")).toHaveTextContent("Payment: mock_payment_123");
    expect(screen.getByTestId("final-cart-count")).toHaveTextContent("1");
    expect(screen.getByTestId("final-address")).toHaveTextContent("Address present");
    expect(screen.getByTestId("final-payment")).toHaveTextContent("mock_payment_123");

    // Step 7: Submit final order - verify context is reset
    fireEvent.click(screen.getByTestId("submit-order"));
    await waitFor(() => screen.getByTestId("info-card"));

    // VERIFY CHECKOUTCONTEXT WAS RESET AFTER ORDER
    expect(screen.getByTestId("cart-after-order")).toHaveTextContent("0");
    expect(screen.getByTestId("address-after-order")).toHaveTextContent("no");
    expect(screen.getByTestId("payment-after-order")).toHaveTextContent("none");

    // Step 8: Continue shopping and verify context is still reset
    fireEvent.click(screen.getByTestId("continue-shopping"));
    await waitFor(() => screen.getByTestId("products-page"));

    // VERIFY CHECKOUTCONTEXT REMAINS RESET
    expect(screen.getByTestId("cart-count")).toHaveTextContent("0");
    expect(screen.getByTestId("has-address")).toHaveTextContent("no");
    expect(screen.getByTestId("payment-intent")).toHaveTextContent("none");
  });

  it("should verify CheckoutContext cart operations work correctly", async () => {
    render(<CheckoutTestApp />);

    // Add product to cart
    fireEvent.click(screen.getByTestId("select-product"));
    await waitFor(() => screen.getByTestId("bid-page"));
    fireEvent.click(screen.getByTestId("submit-bid"));
    await waitFor(() => screen.getByTestId("cart-page"));

    // Verify cart was updated
    expect(screen.getByTestId("cart-items-count")).toHaveTextContent("1");
    expect(screen.getByTestId(`cart-item-${mockProduct.id}`)).toBeInTheDocument();

    // Remove item from cart
    fireEvent.click(screen.getByTestId(`remove-${mockProduct.id}`));
    
    // Verify cart was updated
    await waitFor(() => {
      expect(screen.getByTestId("cart-items-count")).toHaveTextContent("0");
    });
    expect(screen.getByTestId("empty-cart")).toBeInTheDocument();
  });

  it("should maintain CheckoutContext state when navigating back and forth", async () => {
    render(<CheckoutTestApp />);

    // Add product to cart
    fireEvent.click(screen.getByTestId("select-product"));
    await waitFor(() => screen.getByTestId("bid-page"));
    fireEvent.click(screen.getByTestId("submit-bid"));
    await waitFor(() => screen.getByTestId("cart-page"));

    // Verify cart has item
    expect(screen.getByTestId("cart-items-count")).toHaveTextContent("1");

    // Navigate back to products
    fireEvent.click(screen.getByTestId("back-to-products-from-cart"));
    await waitFor(() => screen.getByTestId("products-page"));

    // Verify CheckoutContext persists - cart should still have 1 item
    expect(screen.getByTestId("cart-count")).toHaveTextContent("1");

    // Go back to cart
    fireEvent.click(screen.getByTestId("select-product"));
    await waitFor(() => screen.getByTestId("bid-page"));
    fireEvent.click(screen.getByTestId("submit-bid"));
    await waitFor(() => screen.getByTestId("cart-page"));

    // Should still have 1 item (no duplicates due to reducer logic)
    expect(screen.getByTestId("cart-items-count")).toHaveTextContent("1");
  });
});