// src/components/Navbar.jsx (FINAL POLISHED UI)
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import supabase from "../helper/supabaseClient";

export default function Navbar() {
  const [isRescueUser, setIsRescueUser] = useState(false);
  const [user, setUser] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Load User + Rescue Role
  useEffect(() => {
    const loadUser = async () => {
      const { data: sessionData } = await supabase.auth.getUser();
      const authUser = sessionData?.user;
      setUser(authUser);

      if (!authUser) return;

      const { data } = await supabase
        .from("rescue_team")
        .select("id")
        .eq("user_id", authUser.id)
        .maybeSingle();

      if (data) setIsRescueUser(true);
    };

    loadUser();
  }, []);

  // Base Classes (Refined Colors)
  const baseLink = "px-3 py-2 text-sm font-semibold rounded-lg transition duration-200";
  const mobileLink = "block w-full px-3 py-2 text-sm font-semibold rounded-lg transition duration-200";

  return (
    // Clean White background, stronger shadow
    <nav className="w-full bg-white border-b border-gray-100 shadow-xl sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* LOGO */}
          <Link
            to="/"
            className="flex items-center space-x-2"
            onClick={() => setIsMenuOpen(false)}
          >
            <span className="text-3xl font-extrabold text-indigo-700 tracking-tight">
              PetLink 🐾
            </span>
          </Link>

          {/* DESKTOP MENU */}
          <div className="hidden md:flex md:items-center md:space-x-3">

            {/* Main Links */}
            <Link to="/marketplace" className={`${baseLink} text-gray-700 hover:bg-gray-100 hover:text-indigo-600`}>
              Marketplace
            </Link>
            <Link to="/notifications" className={`${baseLink} text-gray-700 hover:bg-gray-100 hover:text-indigo-600`}>
              Notifications
            </Link>

            {/* PRIMARY ACTION LINK (Lost & Found) */}
            <Link to="/report" className={`${baseLink} font-bold text-white bg-red-600 hover:bg-red-700 ml-2 shadow-md shadow-red-500/50`}>
              🚨 Lost & Found
            </Link>

            {/* AUTHENTICATED USER LINKS (Separated by border) */}
            {user && (
              <div className="flex items-center space-x-2 pl-5 border-l border-gray-200">

                {/* Dashboard is the primary user landing page */}
                <Link to="/dashboard" className={`${baseLink} font-bold text-indigo-600 hover:bg-indigo-50`}>
                  Dashboard
                </Link>

                <Link to={`/user/${user.id}`} className={`${baseLink} text-gray-600 hover:bg-gray-100`}>
                  My Profile
                </Link>
              </div>
            )}

            {/* RESCUE USER SPECIAL LINK */}
            {isRescueUser && (
              <Link
                to="/rescue"
                className={`${baseLink} bg-teal-500 text-white font-bold hover:bg-teal-600 ml-4 shadow-md shadow-teal-500/50`}
              >
                Rescue Dashboard
              </Link>
            )}
          </div>

          {/* MOBILE MENU TOGGLE */}
          <button
            className="md:hidden p-2 rounded-md text-gray-500 hover:bg-gray-100"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* MOBILE MENU */}
      {isMenuOpen && (
        <div className="md:hidden bg-gray-50 border-t border-gray-200 px-4 py-3 space-y-1">

          <Link to="/marketplace" onClick={() => setIsMenuOpen(false)}
            className={`${mobileLink} text-gray-700 hover:bg-indigo-100`}>
            Marketplace
          </Link>

          <Link to="/notifications" onClick={() => setIsMenuOpen(false)}
            className={`${mobileLink} text-gray-700 hover:bg-indigo-100`}>
            Notifications
          </Link>

          {/* PRIMARY ACTION MOBILE LINK (Lost & Found) */}
          <Link to="/report" onClick={() => setIsMenuOpen(false)}
            className={`${mobileLink} font-bold text-white bg-red-600 hover:bg-red-700`}>
            🚨 Lost & Found
          </Link>

          {user && (
            <>
              {/* Dashboard Link */}
              <Link to="/dashboard" onClick={() => setIsMenuOpen(false)}
                className={`${mobileLink} font-bold text-indigo-600 hover:bg-indigo-100`}>
                Dashboard
              </Link>

              {/* Profile Link */}
              <Link to={`/user/${user.id}`} onClick={() => setIsMenuOpen(false)}
                className={`${mobileLink} text-indigo-600 hover:bg-indigo-100`}>
                My Profile
              </Link>
            </>
          )}

          {isRescueUser && (
            <Link to="/rescue" onClick={() => setIsMenuOpen(false)}
              className={`${mobileLink} bg-teal-500 text-white font-bold hover:bg-teal-600`}>
              Rescue Dashboard
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}