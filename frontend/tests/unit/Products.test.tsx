import { describe, it, vi, expect, beforeEach } from "vitest";
import { render, fireEvent, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route, Outlet } from "react-router-dom";
import Products from "../../src/components/Products";

// Mock useFetch with proper type
vi.mock("../../src/hook/fetchData", () => ({
  default: vi.fn(() => ({
    sendRequest: vi.fn(),
    setError: vi.fn(),
    data: null,
    isLoading: false,
    error: "",
    status: 0,
    reset: vi.fn(),
  })),
}));

// Mock useNavigate properly
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock ProductCard component
vi.mock("../../src/components/cards/ProductCard", () => ({
  default: ({ product, onBid }: any) => (
    <div data-testid={`product-${product.id}`}>
      <h3>{product.title}</h3>
      <button onClick={(e) => onBid(product, e)} data-testid={`bid-${product.id}`}>
        Bid on {product.title}
      </button>
    </div>
  ),
}));

// Mock Loader component
vi.mock("../../src/components/common/Loader", () => ({
  default: () => <div data-testid="loader">Loading...</div>,
}));

// Import the mocked hooks
import useFetch from "../../src/hook/fetchData";

// Test component that provides Outlet context
const TestWrapper = ({ searchTerm = "" }: { searchTerm?: string }) => (
  <MemoryRouter>
    <Routes>
      <Route path="/" element={<Outlet context={{ searchTerm }} />}>
        <Route index element={<Products />} />
      </Route>
    </Routes>
  </MemoryRouter>
);

describe("Products Component", () => {
  const mockUseFetch = vi.mocked(useFetch);
  
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Reset to default mock implementation
    mockUseFetch.mockReturnValue({
      sendRequest: vi.fn(),
      setError: vi.fn(),
      data: null,
      isLoading: false,
      error: "",
      status: 0,
      reset: vi.fn(),
    });
  });

  it("shows products when data is loaded", () => {
    // Mock successful data fetch
    mockUseFetch.mockReturnValue({
      sendRequest: vi.fn(),
      setError: vi.fn(),
      data: [
        { 
          id: "1", 
          title: "Abstract Painting",
          imageUrl: "test1.jpg",
          secretPrice: 100,
          currency: "USD",
          description: "Test description",
          yearCreated: "2024",
          productSize: "20x30",
          dateAdded: "2024-01-01",
          artistFirstName: "Anna",
          artistLastName: "Larsen",
          style: "Abstract",
          sold: 0
        }
      ],
      isLoading: false,
      error: "",
      status: 200,
      reset: vi.fn(),
    });

    render(<TestWrapper searchTerm="" />);

    expect(screen.getByTestId("product-1")).toBeInTheDocument();
    expect(screen.getByText("Abstract Painting")).toBeInTheDocument();
  });

  it("filters products based on search term", () => {
    // Mock products data
    mockUseFetch.mockReturnValue({
      sendRequest: vi.fn(),
      setError: vi.fn(),
      data: [
        { 
          id: "1", 
          title: "Abstract Art",
          imageUrl: "test1.jpg",
          secretPrice: 100,
          currency: "USD",
          description: "Test",
          yearCreated: "2024",
          productSize: "20x30",
          dateAdded: "2024-01-01",
          artistFirstName: "Anna",
          artistLastName: "Larsen",
          style: "Abstract",
          sold: 0
        },
        { 
          id: "2", 
          title: "Landscape Painting",
          imageUrl: "test2.jpg",
          secretPrice: 150,
          currency: "USD", 
          description: "Test",
          yearCreated: "2024",
          productSize: "30x40",
          dateAdded: "2024-01-02",
          artistFirstName: "Bjorn",
          artistLastName: "Hansen",
          style: "Landscape",
          sold: 0
        }
      ],
      isLoading: false,
      error: "",
      status: 200,
      reset: vi.fn(),
    });

    render(<TestWrapper searchTerm="abstract" />);

    // Should only show matching products
    expect(screen.getByTestId("product-1")).toBeInTheDocument();
    expect(screen.queryByTestId("product-2")).not.toBeInTheDocument();
  });

  it("shows loading state", () => {
    // Mock loading state
    mockUseFetch.mockReturnValue({
      sendRequest: vi.fn(),
      setError: vi.fn(),
      data: null,
      isLoading: true,
      error: "",
      status: 0,
      reset: vi.fn(),
    });

    render(<TestWrapper searchTerm="" />);

    expect(screen.getByTestId("loader")).toBeInTheDocument();
  });

  it("shows error state", () => {
    // Mock error state
    mockUseFetch.mockReturnValue({
      sendRequest: vi.fn(),
      setError: vi.fn(),
      data: null,
      isLoading: false,
      error: "Failed to fetch products",
      status: 500,
      reset: vi.fn(),
    });

    render(<TestWrapper searchTerm="" />);

    expect(screen.getByText("Failed to fetch products")).toBeInTheDocument();
  });

  it("handles bid button clicks", () => {
    // Mock products data
    mockUseFetch.mockReturnValue({
      sendRequest: vi.fn(),
      setError: vi.fn(),
      data: [
        { 
          id: "1", 
          title: "Test Product",
          imageUrl: "test.jpg",
          secretPrice: 100,
          currency: "USD",
          description: "Test",
          yearCreated: "2024",
          productSize: "20x30",
          dateAdded: "2024-01-01",
          artistFirstName: "Anna",
          artistLastName: "Larsen",
          style: "Abstract",
          sold: 0
        }
      ],
      isLoading: false,
      error: "",
      status: 200,
      reset: vi.fn(),
    });

    render(<TestWrapper searchTerm="" />);

    fireEvent.click(screen.getByTestId("bid-1"));

    expect(mockNavigate).toHaveBeenCalledWith("/giveBid", {
      state: { 
        product: { 
          id: "1", 
          title: "Test Product",
          imageUrl: "test.jpg",
          secretPrice: 100,
          currency: "USD",
          description: "Test",
          yearCreated: "2024",
          productSize: "20x30",
          dateAdded: "2024-01-01",
          artistFirstName: "Anna",
          artistLastName: "Larsen",
          style: "Abstract",
          sold: 0
        } 
      },
    });
  });

  it("renders the products container", () => {
    render(<TestWrapper searchTerm="" />);
    
    // Use the actual class name from your component
    const productsContainer = document.querySelector('.products-page');
    expect(productsContainer).toBeInTheDocument();
  });
});