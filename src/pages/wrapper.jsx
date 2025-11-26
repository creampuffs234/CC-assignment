// src/pages/Wrapper.jsx
import React, { useEffect, useState } from "react";
import supabase from "../helper/supabaseClient";
import { Navigate } from "react-router-dom";
import Navbar from "../components/Navbar";

function Wrapper({ children }) {
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: userData } = await supabase.auth.getUser();
      const user = userData?.user;

      setAuthenticated(!!user);
      setLoading(false);
    };

    checkAuth();
  }, []);

  if (loading) return <div className="p-6">Loading...</div>;

  // REDIRECT UNAUTHENTICATED USERS TO LOGIN (NOT HOME)
  if (!authenticated) return <Navigate to="/login" />;

  return (
    <div>
      <Navbar />
      <div>{children}</div>
    </div>
  );
}

export default Wrapper;
