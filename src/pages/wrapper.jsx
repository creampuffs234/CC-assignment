// src/pages/Wrapper.jsx
import React, { useEffect, useState } from "react";
import supabase from "../helper/supabaseClient";
import { Navigate } from "react-router-dom";
import Navbar from "../components/Navbar";

function Wrapper({ children }) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load initial session
    const loadSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      setSession(session);
      setLoading(false);
    };

    loadSession();

    // --- Auth Listener: Syncs instantly when user logs in or logs out ---
    const {
      data: authListener,
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // Loading screen (prevents flicker)
  if (loading) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center text-gray-600 text-lg">
        Loading...
      </div>
    );
  }

  // If not logged in → redirect to login page
  if (!session) {
    return <Navigate to="/login" replace />;
  }

  // Authenticated → render page normally
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="pt-4 px-4 pb-12">{children}</div>
    </div>
  );
}

export default Wrapper;
