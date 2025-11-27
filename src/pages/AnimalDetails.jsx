// src/pages/AnimalDetails.jsx (Updated Styling)
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getAnimalById } from "../services/animalService";
import AdoptionRequestForm from "../components/AdoptionRequestForm";

export default function AnimalDetails() {
  const { id } = useParams();
  const [animal, setAnimal] = useState(null);
  const [show, setShow] = useState(false);

  // --- FUNCTIONAL LOGIC (UNCHANGED) ---
  useEffect(() => {
    load();
  }, [id]);

  async function load() {
    const { data } = await getAnimalById(id);
    setAnimal(data);
  }
  // --- END FUNCTIONAL LOGIC ---
  
  if (!animal) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 text-xl font-medium text-gray-700">
        Loading pet details...
    </div>
  );

  // Helper for displaying stats, assuming your animal object has these keys
  const StatItem = ({ label, value }) => (
      <div className="p-3 bg-gray-100 rounded-lg text-center shadow-sm">
          <p className="text-xs font-semibold uppercase text-gray-500">{label}</p>
          <p className="text-xl font-bold text-indigo-600 mt-1">{value || 'N/A'}</p>
      </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden">
        
        {/* Pet Image (Prominent Header) */}
        <div className="relative">
            <img 
                src={animal.image_url} 
                alt={`Image of ${animal.title}`}
                className="w-full h-[400px] object-cover object-center" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
            
            {/* Title Overlay */}
            <div className="absolute bottom-0 left-0 p-6">
                <h1 className="text-5xl font-extrabold text-white leading-tight drop-shadow-lg">
                    {animal.title}
                </h1>
                <span className="text-lg text-indigo-200 font-semibold mt-1 block">
                    Available for Adoption
                </span>
            </div>
        </div>

        {/* Details and Actions Section */}
        <div className="p-6 sm:p-8">

            {/* Stats Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                <StatItem label="Species" value={animal.species} />
                <StatItem label="Breed" value={animal.breed} />
                <StatItem label="Age" value={animal.age} />
                <StatItem label="Gender" value={animal.gender} />
            </div>
            
            {/* Description */}
            <h2 className="text-2xl font-bold text-gray-800 border-b pb-2 mb-4">
                About {animal.title}
            </h2>
            <p className="text-gray-600 leading-relaxed mb-8">
                {animal.description || "The shelter has not yet provided a detailed description for this pet."}
            </p>

            {/* Request Adoption Button */}
            <button 
                onClick={() => setShow(true)} 
                className="w-full bg-indigo-600 text-white font-bold px-6 py-3 text-lg rounded-xl mt-4 hover:bg-indigo-700 transition duration-200 shadow-lg shadow-indigo-500/50"
            >
                Request Adoption
            </button>
        </div>


        {/* Adoption Request Modal */}
        {show && (
          <div className="fixed inset-0 bg-black/60 flex justify-center items-center p-4 z-50 transition-opacity duration-300">
            {/* Modal Card */}
            <div className="bg-white p-6 sm:p-8 rounded-xl max-w-lg w-full shadow-2xl relative transform scale-100 transition-transform">
              
              <button 
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-900 transition" 
                onClick={() => setShow(false)}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
              
              <h2 className="text-3xl font-bold text-indigo-600 mb-4 border-b pb-2">
                  Adopt {animal.title}
              </h2>
              
              <AdoptionRequestForm
                animalId={animal.id}
                animalTitle={animal.title}
                onSuccess={() => setShow(false)}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}