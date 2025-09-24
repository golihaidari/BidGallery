import type { CheckoutData } from "../interfaces/CheckoutData";

export const initialCheckoutState: CheckoutData = {
  product: null,
  bidPrice: 0,
  address: null,
  paymentIntentId:"",
};

export function checkoutReducer(
  state: CheckoutData,
  action: { type: string; [key: string]: any } // flexible payload
): CheckoutData {
  switch (action.type) {
    case "SET_PRODUCT":
      return { ...state, product: action.product };
    case "SET_BID":
      return { ...state, bidPrice: action.bidPrice };
    case "SET_ADDRESS":
      return { ...state, address: action.address };
    case "SET_PAYMENT_INTENT":
      return { ...state, paymentIntentId: action.paymentIntentId };
    case "RESET":
      return initialCheckoutState;
    default:
      return state;
  }
}
