
export interface Order {
    order_date : string;
    order_status: string;
    customer_id : string;
    product_id : string;
    address_id : string;
    total_price : number;

}

export interface SubmitCartItem {
    productId: string;
    customer_id :string;
    product_id: string;
    total_price: number;    
}