import type { Address } from "./models/Address";
import type { Product } from "./Product";

export interface CartItem {
  product: Product;
  bidPrice: number;
}

export interface CheckoutData{
    cart: CartItem[]; 
    address : Address | null;
    paymentIntentId: string;
}

