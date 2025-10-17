import type { Address } from "./Address.tsx";
import type { Product } from "./Product.tsx";

export interface CartItem {
  product: Product;
  bidPrice: number;
}

export interface CheckoutData{
    cart: CartItem[]; 
    address : Address | null;
    paymentIntentId: string;
}

