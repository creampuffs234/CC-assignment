// src/pages/About.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import supabase from "../helper/supabaseClient";

export default function About() {
  const navigate = useNavigate();

  const goToDashboard = async () => {
    const { data } = await supabase.auth.getUser();
    if (data?.user) {
      navigate("/dashboard");
    } else {
      navigate("/login");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-100 to-white flex flex-col justify-center items-center p-10">
      <h1 className="text-4xl font-bold text-indigo-700 mb-6">
        About PetLink
      </h1>

      <p className="max-w-3xl text-center text-gray-700 leading-relaxed mb-10 text-lg">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. PetLink is a platform
        dedicated to connecting loving homes with pets in need. We help users adopt
        animals, report lost or found pets, and collaborate with shelters and rescue
        teams across the country. Our mission is to provide a safe, reliable, and
        simple way to care for pets and reunite families.
      </p>

      <button
        onClick={goToDashboard}
        className="bg-indigo-600 text-white px-10 py-4 rounded-xl text-lg shadow-lg hover:bg-indigo-700 transition"
      >
        Go to Dashboard
      </button>
    </div>
  );
}
