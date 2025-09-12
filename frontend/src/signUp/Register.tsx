import { useNavigate } from "react-router-dom";

function Register(){
    const navigate = useNavigate();

    const handleSignUp= ()=> {
        navigate("/main");        
    }

    return(
        <div>
            <h1>This is register page!</h1>
            <button onClick={handleSignUp}> Sign Up</button>
        </div>
        
    )
    
}

export default Register