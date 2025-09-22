// context/CheckoutContext.tsx
import React, { createContext, useReducer } from "react";
import type { CheckoutData } from "../interfaces/CheckoutData";
import { checkoutReducer, initialCheckoutState } from "./checkoutReducer";

type CheckoutContextType = {
  state: CheckoutData;
  dispatch: React.Dispatch<any>;
};

export const CheckoutContext = createContext<CheckoutContextType | null>(null);

export const CheckoutProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(checkoutReducer, initialCheckoutState);

  return (
    <CheckoutContext.Provider value={{ state, dispatch }}>
      {children}
    </CheckoutContext.Provider>
  );
};
export default CheckoutProvider;

export const useCheckout = () => {
  const context = React.useContext(CheckoutContext);
  if (!context) throw new Error("useCheckout must be used within a CheckoutProvider");
  return context;
};