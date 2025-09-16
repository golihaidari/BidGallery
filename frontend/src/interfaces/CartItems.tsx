import type { ProductItem } from "./ProductItem";

export interface CartItem {
    product: ProductItem;
    quantity: number;
    giftWrap: boolean;
    recurringOrder: boolean;
}
