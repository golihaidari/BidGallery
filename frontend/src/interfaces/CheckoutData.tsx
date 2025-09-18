import type { Address } from "./Address";
import type { Product } from "./Product";

export interface CheckoutData{
    product : Product | null;
    bidPrice : number;
    address : Address | null;
}

