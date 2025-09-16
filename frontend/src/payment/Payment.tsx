import { useState } from "react";
import PaymentOptions from "./Options";
import CreditCardForm from "./forms/CreditCard";
import MobilPayForm from "./forms/MobilePayForm";
import GiftCardForm from "./forms/GiftCard";
import { PaymentType } from "./PaymentType";
import  "./Payment.css"

const Payment = () => {

    const[paymentType, setPaymentType]= useState<string>(PaymentType.creditCard);

    return ( 
        <div className="payment">
            <PaymentOptions paymentType={paymentType} setPaymentType={setPaymentType}/>

            {paymentType === PaymentType.creditCard && <CreditCardForm/>}
            {paymentType === PaymentType.mobilePay && <MobilPayForm/>}
            {paymentType === PaymentType.giftCard && <GiftCardForm/>}
        </div>
     );
}
 
export default Payment;
