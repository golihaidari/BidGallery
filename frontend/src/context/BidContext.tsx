import React, {useState } from 'react';
import type {BidData} from '../interfaces/BidData';
import type { ProductItem } from '../interfaces/Product';

export type BidContextType = {
    bid: BidData;
    setBid: (data:BidData) => void;
};

export const BidContext = React.createContext<BidContextType | null>(null);

interface Props {
    children: React.ReactNode;
}

const BidProvider: React.FC<Props> = ({ children }): any => {
    const [bid, setBid] = useState<BidData>({
        product: null,
        bidAmount: 0,
        bidSession_id: undefined,
        paymentClientSecret: undefined,
    });

    return (
        <BidContext.Provider value={{ bid,setBid}}>
            {children}
        </BidContext.Provider>
    )
}

export default BidProvider;
    