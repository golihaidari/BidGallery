import { useState } from "react";


const useFetch =<T,>(url: string)=>{
    const [data, setData] = useState<T>();
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>("");
    const [status, setStatus] = useState(0);
    

    function sendRequest(options?: RequestInit, errorMessage?: string){   
        setIsLoading(true);
        setError("");
        fetch(url,{ ...options, mode: "cors"}) // <- added mode: "cors"
                .then((response) => {
                    setStatus(response.status)
                    if (!response.ok) {
                        setIsLoading(false);
                        setError(response.statusText)
                        throw response.status                                           
                    }

                    return response.json();                     
                })
                .then(d =>{                    
                    setData(d);
                    console.log("Fetched data:", d);
                    setIsLoading(false);
                    setError("");
                })
                .catch((er) => {
                    setIsLoading(false);
                    if (errorMessage !== undefined) {
                        setError(errorMessage);
                    } else {
                        setError(er.message);
                    }
                });
    }

    return {sendRequest, setError, status, data, isLoading, error};     
}

export default useFetch;


