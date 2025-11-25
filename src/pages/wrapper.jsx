// src/pages/Wrapper.jsx
import React, { useEffect, useState } from "react";
import supabase from "../helper/supabaseClient";
import { Navigate } from "react-router-dom";
import Navbar from "../components/Navbar";

function Wrapper({ children }) {
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      setAuthenticated(!!session);
      setLoading(false);
    };

    getSession();
  }, []);

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  if (!authenticated) {
    return <Navigate to="/login" />;
  }

  return (
    <div>
      {/* Navbar always visible for logged-in users */}
      <Navbar />

      {/* Page content (wrapped) */}
      <div className="pt-16">
        {children}
      </div>
    </div>
  );
}

export default Wrapper;
