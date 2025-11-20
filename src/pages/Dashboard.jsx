import React from "react";
import supabase from "../helper/supabaseClient";
import { useNavigate } from "react-router-dom";

function Dashboard() {
  const navigate = useNavigate();

  const Signout = async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) navigate("/login");
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center p-6">
      {/* Card */}
      <div className="bg-white w-full max-w-md p-6 rounded-2xl shadow-lg mt-20 text-center">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">
          Dashboard
        </h2>

        <p className="text-gray-600 mb-6">
          You are logged in. Welcome!
        </p>

        {/* Logout Button */}
        <button
          onClick={Signout}
          className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2 rounded-lg transition"
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}

export default Dashboard;
