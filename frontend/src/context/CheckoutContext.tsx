import React, { useState} from "react";
import type { CheckoutData } from "../interfaces/CheckoutData";


export type CheckoutContextType = {
    checkout: CheckoutData;
    setCheckout: (data:CheckoutData) => void;
};

export const CheckoutContext = React.createContext<CheckoutContextType| null>(null);
interface Props {
    children: React.ReactNode;
}

const CheckoutProvider : React.FC<Props> = ({children}): any => {
    const[checkout, setCheckout] = useState<CheckoutData>({
        product : null,
        bidPrice : 0,
        address : null,
    });
    return (
        <CheckoutContext.Provider value={{checkout, setCheckout}}>
            {children}
        </CheckoutContext.Provider>
    ) 
}

export default CheckoutProvider;
