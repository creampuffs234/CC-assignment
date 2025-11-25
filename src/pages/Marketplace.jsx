// src/pages/Marketplace.jsx (Updated Styling)
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import PetCard from "../components/PetCard";
import FilterBar from "../components/FilterBar";
import { fetchAnimals } from "../services/animalService";

export default function Marketplace() {
  const [animals, setAnimals] = useState([]);
  const [species, setSpecies] = useState("");
  const [breed, setBreed] = useState("");
  const navigate = useNavigate();

  // Load animals with optional filters
  const loadAnimals = async (filters = {}) => {
    // ... (Functional code remains unchanged)
    const { data, error } = await fetchAnimals(filters);

    if (error) {
      console.error("Error fetching animals:", error);
      return;
    }

    setAnimals(data || []);
  };

  // Proper React-safe useEffect (fixed warning)
  useEffect(() => {
    // ... (Functional code remains unchanged)
    const fetchInitial = async () => {
      await loadAnimals();
    };

    fetchInitial();
  }, []);

  return (
    // 1. Marketplace Container: Use a subtle texture or gradient background
    <div className="min-h-screen bg-white"> 
      <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <div className="text-center mb-10">
          <p className="text-sm font-semibold text-indigo-600 uppercase tracking-wide">Find Your New Best Friend</p>
          <h2 className="text-4xl font-extrabold text-gray-900 mt-1 sm:text-5xl">
            Adoption Marketplace 🐾
          </h2>
          <p className="mt-4 text-xl text-gray-500">
            Browse our loving animals ready for a forever home.
          </p>
        </div>

        {/* 2. Filter Bar Styling: Add padding, shadow, and a distinct border */}
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 mb-8">
           <FilterBar
            species={species}
            setSpecies={setSpecies}
            breed={breed}
            setBreed={setBreed}
            onFilter={({ species, breed, search }) =>
              loadAnimals({ species, breed, search })
            }
            onReset={() => {
              setSpecies("");
              setBreed("");
              loadAnimals();
            }}
          />
        </div>


        {/* 3. Content Display: Update the grid for better responsiveness and flow */}
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 mt-6">
          {animals.length === 0 && (
            <p className="text-gray-600 text-center col-span-full py-12 text-lg italic">
              🥺 No animals found matching your criteria. Try adjusting your filters.
            </p>
          )}

          {animals.map((pet) => (
            // Assuming PetCard now looks nicer
            <PetCard 
              key={pet.id}
              pet={pet}
              onView={(id) => navigate(`/animal/${id}`)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}