// src/pages/Wrapper.jsx (Updated Styling)
import React, { useEffect, useState } from "react";
import supabase from "../helper/supabaseClient.js";

import { Navigate } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";

function Wrapper({ children }) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  // --- FUNCTIONAL LOGIC (UNCHANGED) ---
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

    // Auth state listener
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, newSession) => {
        setSession(newSession);
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);
  // --- END FUNCTIONAL LOGIC ---

  // Enhanced Loading State
  if (loading) {
    return (
      <div className="w-full min-h-screen flex flex-col items-center justify-center bg-gray-900 text-indigo-400">
        <svg className="animate-spin h-10 w-10 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <div className="text-xl font-medium">Authenticating and loading content...</div>
      </div>
    );
  }

  // Redirect Logic (UNCHANGED)
  if (!session) {
    return <Navigate to="/login" replace />;
  }

  return (
    // Main Wrapper: Sets base background for content pages
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      {/* Content Area: Adjusted padding for better visual spacing below the sticky Navbar */}
      <div className="py-8 px-4 sm:px-6 lg:px-8">
          {children}
      </div>
    </div>
  );
}

export default Wrapper;