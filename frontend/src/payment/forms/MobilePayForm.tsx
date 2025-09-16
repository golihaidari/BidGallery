import React, { useEffect, useState } from "react";
import PhoneInput from "react-phone-input-2";
import BeatLoader from "../../beatloader/BeatLoader";
import 'react-phone-input-2/lib/style.css';
import mobilepayImg from "../../assets/mobilepayicon.svg"
import usePostData from "../../hook/fetchData"
import type { MobilePay } from "../../interfaces/MobilePay";
import  "../forms/Form.css"

const submitUrl="https://eoysx40p399y9yl.m.pipedream.net"

var form:MobilePay={mobilePayNumber:"", check:false}

const MobilePayForm = () => {

    const[mobilePayForm, setForm]= useState<MobilePay>(form);
    const {sendRequest,setError, status, isLoading, error} = usePostData<string>(submitUrl);

    

    const handleSubmit=(event:React.FormEvent<HTMLFormElement>)=>{
        event.preventDefault();
        const options: RequestInit = {
            method: "POST",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(mobilePayForm),
        };
        sendRequest(options, "Vi beklager ulejligheden, noget gik galt ved indsendelsen af din betaling med MobilePay!");

    }
   
    useEffect(()=>{
        if(status === 200){
            //navigate(routes.submit.routePath);
        }
    },[status])
    
    return (         
        <div> 
            <div className="img-wrapper">
                <img src={mobilepayImg}  alt="" className="mobilepay-Img" /> 
            </div>          
            
            <h3><b>Betale via MobilePay</b></h3>
            <br></br>
            
            {error === ""
                ? <form className="payment-form" onSubmit={handleSubmit}>                          

                    <label className="title-label" htmlFor="mobilePayOption">
                    <b><i>Indtast dit mobilnummer</i></b> 
                    </label> 

                    <div className="full-row">
                        <PhoneInput country={'dk'}  value={mobilePayForm.mobilePayNumber}  onChange={phone=>  setForm({...mobilePayForm, mobilePayNumber: phone})} />
                    </div> 

                    <div className="full-row">
                        <input
                            type="checkbox"
                            name="checkbox"
                            id="checkbox"  
                            checked={(mobilePayForm.check)}
                            onChange={()=> setForm({...mobilePayForm, check: !(mobilePayForm.check)})}
                        />
                        <label htmlFor="checkbox" className="checkbox-label">
                            <i>Husk mig til næste gang</i>
                        </label>
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
                                    <BeatLoader/>
                                </button>
                        }
                    </div>  

                  </form> 
                : ( 
                    <div className="error-text">
                        <p>{error}</p>
                        <button className="retry-btn" onClick={()=>setError("")}>
                            Prøv igen
                        </button>
                    </div>
                )
            }
        </div>   
    );
}
 
export default MobilePayForm;