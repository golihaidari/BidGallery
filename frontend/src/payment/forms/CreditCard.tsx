
import { useEffect, useState } from "react";
import type { CreditCard } from "../../interfaces/CreditCard";
import usePostData from "../../hook/fetchData";

const payment: CreditCard = {
    cardNumber: "",
    cvcNumber: "",
    expiryMonth: "01",
    expiryYear: "23",
};

const submitUrl = "https://eoysx40p399y9yl.m.pipedream.net";

function CreditCardForm() {
    const [customerPayment, setCustomerPayment] = useState<CreditCard>(payment);
    const {sendRequest, setError, status, isLoading, error} = usePostData<string>(submitUrl);

    useEffect(()=>{
        if(status === 200){
            //navigate(routes.submit.routePath);
        }
    },[status]) 

    const handleSubmit =async (event:React.FormEvent<HTMLFormElement>)=> {
        event.preventDefault();
        const options: RequestInit = {
            method: "POST",
            headers:{"Content-Type": "application/json"},
            mode: "cors",
            body: JSON.stringify(customerPayment),
        };

        sendRequest(options, "Vi beklager ulejligheden, noget gik galt ved indsendelsen af din betaling med kort!");
    } 

    const onChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
        setCustomerPayment({
            ...customerPayment,
            [event.target.name]: event.target.value,
        });
    };

    const onSelect = (event: React.ChangeEvent<HTMLSelectElement>): void => {
        setCustomerPayment({
            ...customerPayment,
            [event.target.name]: event.target.value,
        });
    };

    return (
        <div className="payment-block">
            {error === "" ? (
                <form onSubmit={handleSubmit}>
                    <div className="payment">
                        <h2 className="fullrow">Kort oplysninger</h2>
                        <label className="paymentblock" htmlFor="expiryMonth">
                            Udløbsmåned
                        </label>{" "}
                        <label className="paymentblock" htmlFor="expiryYear">
                            Udløbsår
                        </label>
                        <div className="paymentblock">
                            <select
                                autoFocus
                                required
                                className="dropdownpayment"
                                id="expiryMonth"
                                name="expiryMonth"
                                onChange={onSelect}
                            >
                                <option> 01 </option>
                                <option> 02 </option>
                                <option> 03 </option>
                                <option> 04 </option>
                                <option> 05 </option>
                                <option> 06 </option>
                                <option> 07 </option>
                                <option> 08 </option>
                                <option> 09 </option>
                                <option> 10 </option>
                                <option> 11 </option>
                                <option> 12 </option>
                            </select>
                        </div>
                        <div className="paymentblock">
                            <select
                                required
                                className="dropdownpayment"
                                id="expiryYear"
                                name="expiryYear"
                                onSelect={onSelect}
                            >
                                <option> 23 </option>
                                <option> 24 </option>
                                <option> 25 </option>
                                <option> 26 </option>
                                <option> 27 </option>
                                <option> 28 </option>
                                <option> 29 </option>
                                <option> 30 </option>
                                <option> 31 </option>
                                <option> 32 </option>
                                <option> 33 </option>
                                <option> 34 </option>
                                <option> 35 </option>
                            </select>
                        </div>
                        <label className="paymentblock" htmlFor="cardNumber">
                            Kortnummer
                        </label>
                        <label className="paymentblock" htmlFor="cvcNumber">
                            {" "}
                            CVC
                        </label>
                        <div className="paymentblock">
                            <input
                                required
                                type="text"
                                name="cardNumber"
                                id="cardNumber"
                                minLength={15} //American Express
                                maxLength={16} //Others
                                onChange={onChange}
                            />
                        </div>
                        <div className="paymentblock">
                            <input
                                className="cvcfield"
                                required
                                pattern="[0-9]{3}"
                                type="text"
                                maxLength={3}
                                id="cvcNumber"
                                name="cvcNumber"
                                onChange={onChange}
                            />
                        </div>
                        <div className="fullrow">
                            {!isLoading ? (
                                <button
                                    className="confirm_payment"
                                    disabled={isLoading}
                                    type="submit"
                                >
                                    Bekræft Betaling
                                </button>
                            ) : (
                                <p className="loading">Loading...</p>
                            )}
                        </div>
                    </div>
                </form>
            ) : (
                <div>
                    <p className="error-text">{error}</p>
                    <button className="confirm_payment" onClick={()=>setError("")}>
                        Prøv igen
                    </button>
                </div>
            )}
        </div>
    );
}

export default CreditCardForm;
