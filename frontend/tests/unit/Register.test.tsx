import { describe, it, vi, beforeEach, expect } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Register from "../../src/components/Register";


// -----------------------------
// Mock variables
// -----------------------------
const mockNavigate = vi.fn();
const mockLoginContext = vi.fn();
const mockSendRequest = vi.fn();
let mockRegisterData: any = null;

// -----------------------------
// React Router mock
// -----------------------------
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return { ...actual, useNavigate: () => mockNavigate };
});

// -----------------------------
// AuthContext mock
// -----------------------------
vi.mock("../../src/context/AuthContext.tsx", () => ({
  useAuth: () => ({ login: mockLoginContext }),
}));

// -----------------------------
// FormTemplate mock
// -----------------------------
vi.mock("../../src/components/common/FormTemplate", () => ({
  __esModule: true,
  default: ({ children, onSubmit, error }: any) => (
    <form data-testid="form" onSubmit={onSubmit}>
      {children}
      {error && <div data-testid="api-error">{error}</div>}
      <button type="submit">Sign Up</button>
    </form>
  ),
}));

// -----------------------------
// FormValidator mock
// -----------------------------
vi.mock("../../src/utils/UserFormValidator", () => ({
  __esModule: true,
  default: {
    validateField: vi.fn((field: string, value: string) => (!value ? `${field} is required` : "")),
  },
}));

// -----------------------------
// usePostData mock
// -----------------------------
vi.mock("../../src/hook/fetchData", () => ({
  __esModule: true,
  default: () => ({
    sendRequest: mockSendRequest,
    data: mockRegisterData,
    isLoading: false,
    error: mockRegisterData?.success === false ? mockRegisterData.message : null,
    status: mockRegisterData?.success ? 200 : mockRegisterData ? 400 : null,
    setError: vi.fn(),
  }),
}));

// -----------------------------
// Helper to render Register
// -----------------------------
const renderRegister = () =>
  render(
    <MemoryRouter>
      <Register />
    </MemoryRouter>
  );

// -----------------------------
// Tests
// -----------------------------
describe("Register Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRegisterData = null;
  });

  // -----------------------------
  // Component Rendering
  // -----------------------------
  it("renders all basic fields", () => {
    renderRegister();

    expect(screen.getByLabelText(/first name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/last name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Password$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Re-enter Password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/account type/i)).toBeInTheDocument();
  });

  it("renders artist-specific fields when accountType is artist", async () => {
    renderRegister();

    // select "Artist" account type
    const accountTypeSelect = screen.getByLabelText(/account type/i);
    fireEvent.mouseDown(accountTypeSelect);
    const artistOption = await screen.findByText("Artist");
    fireEvent.click(artistOption);

    expect(await screen.findByLabelText(/style/i)).toBeInTheDocument();
    expect(await screen.findByLabelText(/bio/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/profile image url/i)).toBeInTheDocument();
  });

  // -----------------------------
  // Form Validation
  // -----------------------------
  it("shows validation errors when required fields are empty", async () => {
    renderRegister();

    fireEvent.click(screen.getByText(/sign up/i));

    expect(await screen.findByText(/firstName is required/i)).toBeInTheDocument();
    expect(await screen.findByText(/lastName is required/i)).toBeInTheDocument();
    expect(await screen.findByText(/email is required/i)).toBeInTheDocument();
  });

  // -----------------------------
  // Registration API: Customer Success
  // -----------------------------
  it("successful customer registration triggers login and navigation", async () => {
    mockRegisterData = { success: true, email: "customer@example.com" };

    renderRegister();

    // Fill customer fields
    fireEvent.change(screen.getByLabelText(/first name/i), { target: { value: "goli" } });
    fireEvent.change(screen.getByLabelText(/last name/i), { target: { value: "haidari" } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: "customer@example.com" } });
    fireEvent.change(screen.getByLabelText(/^Password$/i), { target: { value: "123456" } });
    fireEvent.change(screen.getByLabelText(/Re-enter Password/i), { target: { value: "123456" } });

    // Account type default is customer
    fireEvent.change(screen.getByLabelText(/mobile number/i), { target: { value: "12345678" } });
    fireEvent.change(screen.getByLabelText(/postal code/i), { target: { value: "1000" } });
    fireEvent.change(screen.getByLabelText(/city/i), { target: { value: "Copenhagen" } });
    fireEvent.change(screen.getByLabelText(/address1/i), { target: { value: "Street 1" } });

    fireEvent.click(screen.getByText(/sign up/i));

    await waitFor(() => {
      expect(mockSendRequest).toHaveBeenCalledTimes(1);
      expect(mockLoginContext).toHaveBeenCalledWith("customer@example.com");
      expect(mockNavigate).toHaveBeenCalledWith("/login"); // This matches your component
    });
  });

  // -----------------------------
  // Registration API: Artist Success
  // -----------------------------
  it("successful artist registration triggers login and navigation", async () => {
    mockRegisterData = { success: true, email: "artist@example.com" };

    renderRegister();

    // Fill basic fields
    fireEvent.change(screen.getByLabelText(/first name/i), { target: { value: "goli" } });
    fireEvent.change(screen.getByLabelText(/last name/i), { target: { value: "haidari" } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: "artist@example.com" } });
    fireEvent.change(screen.getByLabelText(/^Password$/i), { target: { value: "123456" } });
    fireEvent.change(screen.getByLabelText(/Re-enter Password/i), { target: { value: "123456" } });

    // Select account type "Artist"
    const accountTypeSelect = screen.getByLabelText(/account type/i);
    fireEvent.mouseDown(accountTypeSelect);
    const artistOption = await screen.findByText("Artist");
    fireEvent.click(artistOption);

    // Fill artist-specific fields
    fireEvent.change(screen.getByLabelText(/style/i), { target: { value: "Abstract" } });
    fireEvent.change(screen.getByLabelText(/bio/i), { target: { value: "I am an artist" } });

    fireEvent.click(screen.getByText(/sign up/i));

    await waitFor(() => {
      expect(mockSendRequest).toHaveBeenCalledTimes(1);
      expect(mockLoginContext).toHaveBeenCalledWith("artist@example.com");
      expect(mockNavigate).toHaveBeenCalledWith("/login"); // Fixed: changed from "/" to "/login"
    });
  });

  // -----------------------------
  // Registration API: Fail scenario
  // -----------------------------
  it("failed registration shows API error", async () => {
    mockRegisterData = { success: false, message: "Email already exists" };

    renderRegister();

    fireEvent.change(screen.getByLabelText(/first name/i), { target: { value: "goli" } });
    fireEvent.change(screen.getByLabelText(/last name/i), { target: { value: "haidari" } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: "golihaidari@example.com" } });
    fireEvent.change(screen.getByLabelText(/^Password$/i), { target: { value: "123456" } });
    fireEvent.change(screen.getByLabelText(/Re-enter Password/i), { target: { value: "123456" } });

    fireEvent.click(screen.getByText(/sign up/i));

    await waitFor(() => {
      const errorMessage = screen.getByTestId("api-error");
      expect(errorMessage).toHaveTextContent(/email already exists/i);
      expect(mockLoginContext).not.toHaveBeenCalled();
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });
});