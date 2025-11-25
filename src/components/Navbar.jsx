// src/components/Navbar.jsx (Updated Styling)
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import supabase from "../helper/supabaseClient";

export default function Navbar() {
  const [user, setUser] = useState(null);
  const [isRescueUser, setIsRescueUser] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false); // UI State for mobile menu

  // --- FUNCTIONAL LOGIC (UNCHANGED) ---
  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data?.user || null);

      if (data?.user) {
        const { data: rescue } = await supabase
          .from("rescue_team")
          .select("id")
          .eq("user_id", data.user.id)
          .maybeSingle();

        if (rescue) setIsRescueUser(true);
      }
    };
    load();
  }, []);
  // --- END FUNCTIONAL LOGIC ---

  // Base classes for a standard link button/style
  const baseLinkClasses = "px-3 py-2 text-sm font-medium rounded-lg transition duration-150";
  // Classes for links in the mobile menu (block display)
  const mobileLinkClasses = "block w-full text-left px-3 py-2 text-sm font-medium rounded-lg transition duration-150";

  return (
    // Dark Background, Sticky, Shadow
    <nav className="w-full bg-gray-800 border-b border-indigo-500/50 sticky top-0 z-40 shadow-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Logo / Brand */}
          <Link to="/" className="flex items-center space-x-2" onClick={() => setIsMenuOpen(false)}>
            <span className="text-2xl font-extrabold text-indigo-400 tracking-tight">
              PetLink 🐕
            </span>
          </Link>

          {/* Desktop Menu (Hidden on small screens) */}
          <div className="hidden md:flex md:items-center md:space-x-2">
            
            {/* Main Nav Links (Light Text, Indigo Hover) */}
            <Link to="/marketplace" className={`${baseLinkClasses} text-gray-300 hover:bg-indigo-600 hover:text-white`}>
              Marketplace
            </Link>
            <Link to="/add-pet" className={`${baseLinkClasses} text-gray-300 hover:bg-indigo-600 hover:text-white`}>
              Add Pet
            </Link>
            <Link to="/notifications" className={`${baseLinkClasses} text-gray-300 hover:bg-indigo-600 hover:text-white`}>
              Notifications
            </Link>

            {/* User Links Group */}
            {user && (
              <>
                <Link to="/dashboard" className={`${baseLinkClasses} font-semibold text-indigo-300 hover:bg-indigo-600 hover:text-white ml-4`}>
                  Dashboard
                </Link>
                <Link to={`/user/${user.id}`} className={`${baseLinkClasses} text-gray-300 hover:bg-gray-700 hover:text-white`}>
                  My Profile
                </Link>
              </>
            )}

            {/* Rescue Team Link - Highlighted */}
            {isRescueUser && (
              <Link to="/rescue" className={`${baseLinkClasses} font-bold text-yellow-300 bg-red-700 hover:bg-red-600 ml-4 border border-yellow-300`}>
                🚨 Rescue Reports
              </Link>
            )}
            
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              // Button color/icon contrast for dark mode
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
            >
              {isMenuOpen ? (
                  <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              ) : (
                  <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Content (Dropdown) */}
      <div className={`md:hidden ${isMenuOpen ? 'block' : 'hidden'}`}>
        {/* Dark background for mobile menu links */}
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t border-gray-700 bg-gray-700">
          
          <Link to="/marketplace" onClick={() => setIsMenuOpen(false)} className={`${mobileLinkClasses} text-gray-200 hover:bg-indigo-600 hover:text-white`}>
            Marketplace
          </Link>
          <Link to="/add-pet" onClick={() => setIsMenuOpen(false)} className={`${mobileLinkClasses} text-gray-200 hover:bg-indigo-600 hover:text-white`}>
            Add Pet
          </Link>
          <Link to="/notifications" onClick={() => setIsMenuOpen(false)} className={`${mobileLinkClasses} text-gray-200 hover:bg-indigo-600 hover:text-white`}>
            Notifications
          </Link>

          {/* Mobile User Links */}
          {user && (
            <>
              <Link to="/dashboard" onClick={() => setIsMenuOpen(false)} className={`${mobileLinkClasses} font-semibold text-indigo-300 hover:bg-indigo-600 hover:text-white`}>
                Dashboard
              </Link>
              <Link to={`/user/${user.id}`} onClick={() => setIsMenuOpen(false)} className={`${mobileLinkClasses} text-gray-200 hover:bg-gray-600 hover:text-white`}>
                My Profile
              </Link>
            </>
          )}

          {/* Mobile Rescue Link */}
          {isRescueUser && (
            <Link to="/rescue" onClick={() => setIsMenuOpen(false)} className={`${mobileLinkClasses} font-bold text-yellow-300 bg-red-700 hover:bg-red-600`}>
              🚨 Rescue Reports
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}