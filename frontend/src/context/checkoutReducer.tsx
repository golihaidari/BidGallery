import type { CheckoutData } from "../interfaces/CheckoutData";

export const initialCheckoutState: CheckoutData = {
  cart: [],          // cart items
  address: null,     // shipping address
  paymentIntentId: "", // stripe or payment id
};

// Reducer
export function checkoutReducer(
  state: CheckoutData,
  action: { type: string; [key: string]: any }
): CheckoutData {
  switch (action.type) {
    case "ADD_TO_CART":
      // prevent duplicates
      if (state.cart.find((item) => item.product.id === action.item.product.id)) {
        return state;
      }
      return {
        ...state,
        cart: [...state.cart, action.item],
      };

    case "REMOVE_FROM_CART":
      return {
        ...state,
        cart: state.cart.filter((i) => i.product.id !== action.productId),
      };

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