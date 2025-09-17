import type { Product } from "./Product";

export interface Cart {
    product: Product;
    quantity: number;
    giftWrap: boolean;
    recurringOrder: boolean;
}
