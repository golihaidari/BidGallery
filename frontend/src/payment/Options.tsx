import { PaymentType } from "./PaymentType";
import "./Payment.css"
const PaymentOptions = ({paymentType,setPaymentType}:{paymentType:string, setPaymentType:(type: string) => void}) => 
{
    const onChangePayment = (event : React.ChangeEvent<HTMLInputElement>) => {
        setPaymentType(event.currentTarget.value);
    };
     return(
        <div className="options">

            <div className="option">                
                <input type="radio" id="creditCard" value={PaymentType.creditCard} checked={paymentType === PaymentType.creditCard } onChange={onChangePayment}/>
                <label htmlFor="creditCard">Credit Card</label>
            </div>

            <div className="option">                
                <input type="radio" id="mobilePay" value= {PaymentType.mobilePay} checked={paymentType === PaymentType.mobilePay} onChange={onChangePayment}/>                
                <label htmlFor="mobilePay">MobilePay</label>
            </div>

            <div className="option">                
                <input type="radio" id="giftCard" value={PaymentType.giftCard} checked={paymentType === PaymentType.giftCard} onChange={onChangePayment}/>                
                <label htmlFor="giftCard">Gift Card</label>
            </div>
            
        </div>
     );

}
export default PaymentOptions;