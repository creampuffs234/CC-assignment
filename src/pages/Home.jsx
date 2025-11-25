import React from "react";
import { Link } from "react-router-dom";

function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-blue-300">
      <div className="bg-white p-10 rounded-2xl shadow-lg w-full max-w-md text-center">
        
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          🐾 Pet Welfare Portal
        </h1>
        <p className="text-gray-600 mb-8">
          Welcome! Please choose one of the options below to continue.
        </p>

        <div className="flex flex-col gap-4">
          
          <Link
            to="/register"
            className="w-full bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 transition font-medium"
          >
            Create an Account
          </Link>

          <Link
            to="/login"
            className="w-full border border-blue-600 text-blue-600 py-3 rounded-xl hover:bg-blue-50 transition font-medium"
          >
            Login
          </Link>

        </div>
      </div>
    </div>
  );
}

export default Home;
