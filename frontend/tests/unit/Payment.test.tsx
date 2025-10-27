import { describe, it, vi, expect, beforeEach } from "vitest";
import { render, fireEvent, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Payment from "../../src/components/payment/Payment";

// Mock the child components with correct PaymentType values
vi.mock("../../src/components/payment/PaymentOptions", () => ({
  default: ({ paymentType, setPaymentType }: any) => (
    <div data-testid="payment-options">
      <label>
        <input
          type="radio"
          value="CreditCard"
          checked={paymentType === "CreditCard"}
          onChange={() => setPaymentType("CreditCard")}
          data-testid="credit-card-option"
        />
        Credit Card
      </label>
      <label>
        <input
          type="radio"
          value="MobilePay"
          checked={paymentType === "MobilePay"}
          onChange={() => setPaymentType("MobilePay")}
          data-testid="mobilepay-option"
        />
        MobilePay
      </label>
      <label>
        <input
          type="radio"
          value="GiftCard"
          checked={paymentType === "GiftCard"}
          onChange={() => setPaymentType("GiftCard")}
          data-testid="giftcard-option"
        />
        Gift Card
      </label>
    </div>
  ),
}));

vi.mock("../../src/components/payment/forms/CreditCard", () => ({
  default: () => <div data-testid="credit-card-form">Credit Card Form</div>,
}));

vi.mock("../../src/components/payment/forms/MobilePay", () => ({
  default: () => <div data-testid="mobilepay-form">MobilePay Form</div>,
}));

vi.mock("../../src/components/payment/forms/GiftCard", () => ({
  default: () => <div data-testid="giftcard-form">Gift Card Form</div>,
}));

describe("Payment Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders payment options and default credit card form", () => {
    render(
      <MemoryRouter>
        <Payment />
      </MemoryRouter>
    );

    expect(screen.getByTestId("payment-options")).toBeInTheDocument();
    expect(screen.getByTestId("credit-card-form")).toBeInTheDocument();
  });

  it("switches to mobilepay form when mobilepay option is selected", () => {
    render(
      <MemoryRouter>
        <Payment />
      </MemoryRouter>
    );

    const mobilepayOption = screen.getByTestId("mobilepay-option");
    fireEvent.click(mobilepayOption);

    expect(screen.getByTestId("mobilepay-form")).toBeInTheDocument();
    expect(screen.queryByTestId("credit-card-form")).not.toBeInTheDocument();
  });

  it("switches to giftcard form when giftcard option is selected", () => {
    render(
      <MemoryRouter>
        <Payment />
      </MemoryRouter>
    );

    const giftcardOption = screen.getByTestId("giftcard-option");
    fireEvent.click(giftcardOption);

    expect(screen.getByTestId("giftcard-form")).toBeInTheDocument();
    expect(screen.queryByTestId("credit-card-form")).not.toBeInTheDocument();
  });

  it("switches back to credit card form", () => {
    render(
      <MemoryRouter>
        <Payment />
      </MemoryRouter>
    );

    // Switch to mobilepay first
    const mobilepayOption = screen.getByTestId("mobilepay-option");
    fireEvent.click(mobilepayOption);
    expect(screen.getByTestId("mobilepay-form")).toBeInTheDocument();

    // Switch back to credit card
    const creditCardOption = screen.getByTestId("credit-card-option");
    fireEvent.click(creditCardOption);
    expect(screen.getByTestId("credit-card-form")).toBeInTheDocument();
  });
});