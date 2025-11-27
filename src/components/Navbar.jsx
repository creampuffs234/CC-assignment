// src/components/Navbar.jsx (FINAL FIXED & DARKER VERSION)
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import supabase from "../helper/supabaseClient.js";

export default function Navbar() {
  const [isRescueUser, setIsRescueUser] = useState(false);
  const [user, setUser] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Load User + Rescue Role (FUNCTIONAL LOGIC REMAINS UNCHANGED)
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

  // Base Classes
  const baseLink =
    "px-3 py-2 text-sm font-semibold rounded-lg transition duration-200";
  const mobileLink =
    "block w-full px-3 py-2 text-sm font-semibold rounded-lg transition duration-200";

  return (
    // DARKER CONTAINER: Changed bg-white to bg-gray-900 and border/shadow colors
    <nav className="w-full bg-gray-900 border-b border-indigo-700 shadow-2xl sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:pxA8">
        <div className="flex justify-between items-center h-16">
          
          {/* LOGO ROUTE UPDATED TO /dashboard */}
          <Link
            to="/dashboard"
            className="flex items-center space-x-2"
            onClick={() => setIsMenuOpen(false)}
          >
            <span className="text-3xl font-extrabold text-indigo-400 tracking-tight">
              PetLink 🐾
            </span>
          </Link>

          {/* DESKTOP MENU */}
          <div className="hidden md:flex md:items-center md:space-x-3">
            <Link
              to="/marketplace"
              className={`${baseLink} text-gray-300 hover:bg-gray-800 hover:text-indigo-400`}
            >
              Marketplace
            </Link>

            <Link
              to="/notifications"
              className={`${baseLink} text-gray-300 hover:bg-gray-800 hover:text-indigo-400`}
            >
              Notifications
            </Link>

            <Link
              to="/report"
              className={`${baseLink} font-bold text-white bg-red-600 hover:bg-red-700 ml-2 shadow-md shadow-red-700/50`}
            >
              🚨 Lost & Found
            </Link>

            {user && (
              <div className="flex items-center space-x-2 pl-5 border-l border-gray-700">
                <Link
                  to="/dashboard"
                  className={`${baseLink} font-bold text-indigo-400 hover:bg-gray-800`}
                >
                  Dashboard
                </Link>
                <Link
                  to={`/user/${user.id}`}
                  className={`${baseLink} text-gray-300 hover:bg-gray-800 hover:text-indigo-400`}
                >
                  My Profile
                </Link>
              </div>
            )}

            {isRescueUser && (
              <Link
                to="/rescue"
                className={`${baseLink} bg-teal-500 text-white font-bold hover:bg-teal-600 ml-4 shadow-md shadow-teal-700/50`}
              >
                Rescue Dashboard
              </Link>
            )}
          </div>

          {/* MOBILE MENU BUTTON */}
          <button
            className="md:hidden p-2 rounded-md text-gray-400 hover:bg-gray-800 hover:text-white"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* MOBILE MENU */}
      {isMenuOpen && (
        <div className="md:hidden bg-gray-800 border-t border-gray-700 px-4 py-3 space-y-1">
          <Link
            to="/marketplace"
            onClick={() => setIsMenuOpen(false)}
            className={`${mobileLink} text-gray-300 hover:bg-gray-700`}
          >
            Marketplace
          </Link>

          <Link
            to="/notifications"
            onClick={() => setIsMenuOpen(false)}
            className={`${mobileLink} text-gray-300 hover:bg-gray-700`}
          >
            Notifications
          </Link>

          <Link
            to="/report"
            onClick={() => setIsMenuOpen(false)}
            className={`${mobileLink} font-bold text-white bg-red-600 hover:bg-red-700`}
          >
            🚨 Lost & Found
          </Link>

          {user && (
            <>
              <Link
                to="/dashboard"
                onClick={() => setIsMenuOpen(false)}
                className={`${mobileLink} font-bold text-indigo-400 hover:bg-gray-700`}
              >
                Dashboard
              </Link>

              <Link
                to={`/user/${user.id}`}
                onClick={() => setIsMenuOpen(false)}
                className={`${mobileLink} text-gray-300 hover:bg-gray-700`}
              >
                My Profile
              </Link>
            </>
          )}

          {isRescueUser && (
            <Link
              to="/rescue"
              onClick={() => setIsMenuOpen(false)}
              className={`${mobileLink} bg-teal-500 text-white font-bold hover:bg-teal-600`}
            >
              Rescue Dashboard
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}
