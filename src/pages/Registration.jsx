import React, { useState } from "react";
import supabase from "../helper/supabaseClient";
import {Link} from 'react-router-dom';

function Registration() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);

  // --- FUNCTIONAL LOGIC (UNCHANGED) ---
  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("Creating user...");
    setError(false);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      setMessage(error.message);
      setError(true);
      return;
    }

    if (data) {
      setMessage("✅ User account created. Check your email to verify.");
      setError(false);
    }

    setEmail("");
    setPassword("");
  };
  // --- END FUNCTIONAL LOGIC ---

  return (
    // Darker Background
    <div className="min-h-screen flex items-center justify-center bg-gray-900 p-6">
      
      {/* Main Card Container */}
      <div className="bg-gray-800 shadow-2xl rounded-xl p-8 sm:p-10 w-full max-w-md border-t-4 border-indigo-500">
        
        <h2 className="text-3xl font-extrabold text-white text-center mb-2">
          Create an Account
        </h2>
        <p className="text-center text-gray-400 mb-6">
          Start finding your next best friend today.
        </p>

        {/* Message/Notification Box */}
        {message && (
          <div
            className={`mb-6 p-4 rounded-lg font-medium border ${
              error 
                ? "bg-red-900/40 text-red-300 border-red-700" // Darker error colors
                : "bg-green-900/40 text-green-300 border-green-700" // Darker success colors
            }`}
          >
            {message}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block mb-1 font-medium text-gray-300">Email</label>
            <input
              type="email"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              // Darker input styling
              className="w-full px-4 py-3 border border-gray-600 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm transition"
            />
          </div>

          <div>
            <label className="block mb-1 font-medium text-gray-300">Password</label>
            <input
              type="password"
              placeholder="Enter your password (min 6 characters)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              // Darker input styling
              className="w-full px-4 py-3 border border-gray-600 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm transition"
            />
          </div>

          <button
            type="submit"
            // Primary action button styling
            className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg hover:bg-indigo-500 transition-colors font-bold text-lg shadow-md shadow-indigo-700/50"
          >
            Create Account
          </button>
        </form>
        
        {/* Link to Login */}
        <div className="mt-6 text-center text-sm">
            <span className="text-gray-400">Already have an account? </span>
            <Link to="/login" className="font-semibold text-indigo-400 hover:text-indigo-300 transition">
                Log in
            </Link>
        </div>

      </div>
    </div>
  );
}

export default Registration;