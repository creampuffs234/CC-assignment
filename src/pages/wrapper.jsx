import React, { useEffect, useState } from "react";
import supabase from "../helper/supabaseClient";
import { Navigate } from "react-router-dom";

function Wrapper({ children }) {
  const [authentication, setauthenticated] = useState(false);
  const [Loading, setLoading] = useState(true);

  useEffect(() => {
    const getSession = async () => {
        const{
            data:{session},
        }= await supabase.auth.getSession();

//!!null -> faulse
//{} -> true
            setauthenticated(!!session);
            setLoading(false);
        

    }

    getSession();
}, []);

    if (Loading) {
        return <div>Loading....</div>
    }
    else {
        if (authentication){
        return <>{children}</>;
    }
    return <Navigate to= "/login"/>
    }
}

export default Wrapper