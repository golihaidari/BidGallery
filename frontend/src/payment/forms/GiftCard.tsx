import { useEffect, useState } from "react";
import giftCardIcon from "../../assets/giftcardicon.png";
import Beatloader from "../../beatloader/BeatLoader";
import usePosthData from "../../hook/fetchData";
import type { GiftCard } from "../../interfaces/GiftCard";
import  "../Payment.css"

var form:GiftCard={giftCardnumber:"", securityCode:""}

const submitUrl="https://eoysx40p399y9yl.m.pipedream.net"

const GiftCardForm =()=>{   

    const[giftCardForm, setForm] = useState<GiftCard>(form)
    
    const onChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
        setForm({
            ...giftCardForm,
            [event.target.name]: event.target.value,
        });
    };
    
    const {sendRequest,setError, status, isLoading, error} = usePosthData<string>(submitUrl);

    const handleSubmit =async (event:React.FormEvent<HTMLFormElement>)=> {
        event.preventDefault();
        const options: RequestInit = {
            method: "POST",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(giftCardForm),
        };
        sendRequest(options, "Vi beklager ulejligheden, noget gik galt ved indsendelsen af din betaling med gavekort!");
    }
        

    useEffect(()=>{
        if(status === 200){
           // navigate(routes.submit.routePath);
        }
    },[status])

 
    return ( 
        
        <div> 
            <div className="image-wrapper">
                <img src={giftCardIcon}  alt="" className="giftcard-Img" /> 
            </div>           

            {error === "" 
                ? <form className="payment-form" onSubmit={handleSubmit}>

                    <label className="title-label" htmlFor="giftCardOption"><b> Indtast gavekortinformationer </b></label>
                    <input
                        required
                        pattern="[0-9]{19}"
                        type="tel"
                        placeholder="Gavekort nummer"
                        id="giftCardnumber"
                        name="giftCardnumber"                    
                        onChange={onChange}                    
                    />
                    
                    
                    <div className="full-row">
                        <input
                            required
                            pattern="[0-9]{3}"
                            type="tel"
                            placeholder="Sikkerhedskode"
                            id="securityCode"
                            name="securityCode"                   
                            onChange={onChange}
                        />  
                        <button className="openButton" type="button"><i>Indløs</i></button>  
                    </div>

                    <div className="full-row">
                        {isLoading === false 
                            ?   <button className="confirm-payment-btn" 
                                    type="submit" 
                                    disabled={false} >
                                    Bekræft Betaling
                                </button>
                            :   <button className="confirm-payment-btn" 
                                    type="submit" 
                                    disabled={true}>
                                    <Beatloader/>                 
                                </button>
                        }                            
                    </div>
                            
                  </form>
                : ( <div className="error-text">
                        <p>{error}</p>
                        <button className="retry-btn" onClick={()=> setError("")}>
                            Prøv igen
                        </button>
                    </div>
                   )
            }

        </div>
    );
}
 
export default GiftCardForm;


