import type { Product } from "./Product";

export interface BidData{
    product : Product | null;
    bidAmount : number;
    bidSession_id?: string;
    paymentClientSecret?: string;    
}