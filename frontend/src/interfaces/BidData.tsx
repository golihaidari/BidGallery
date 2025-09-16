import type { ProductItem } from "./ProductItem";

export interface BidData{
    product : ProductItem | null;
    bidAmount : number;
    bidSession_id?: string;
    paymentClientSecret?: string;    
}