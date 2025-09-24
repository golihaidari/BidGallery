import type { Address } from "./models/Address";
import type { Product } from "./Product";

export interface CheckoutData{
    product : Product | null;
    bidPrice : number;
    address : Address | null;
    paymentIntentId: string;
}

