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

  // 🔥 FIX: loadAnimals is outside the effect (safe)
  const loadAnimals = async (filters = {}) => {
    const { data, error } = await fetchAnimals(filters);

    if (error) {
      console.error("Error fetching animals:", error);
      return;
    }

    setAnimals(data || []);
  };

  // 🔥 FIX: safe async wrapper inside effect
  useEffect(() => {
    const init = async () => {
      await loadAnimals();
    };
    init();
  }, []);

  return (
    // Background change: Using a clean, light color with a subtle pattern/wave top
    <div className="min-h-screen bg-blue-200 ">
      
      {/* Hero Section Banner */}
      <div className="bg-indigo-600 pb-16 pt-12 shadow-lg">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            
            <p className="text-sm font-semibold text-indigo-200 uppercase tracking-widest">
              Find Your New Best Friend
            </p>
            <h2 className="text-5xl font-extrabold text-white mt-2 sm:text-6xl">
              Adoption Marketplace 🐾
            </h2>
            <p className="mt-4 text-xl text-indigo-100 max-w-2xl mx-auto">
              Browse animals posted by verified shelters.
            </p>
          </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8"> {/* Negative margin pulls content up */}

        {/* Filter Bar (Now sits as a prominent card on the background) */}
        <div className="bg-white p-6 sm:p-8 rounded-xl shadow-2xl border border-indigo-200/50 mb-10">
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

        {/* Animals Grid */}
        <div className="pb-12">
            <h3 className="text-2xl font-bold text-gray-800 mb-6">Available Pets</h3>
            
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {animals.length === 0 && (
                <div className="text-center col-span-full py-12 bg-white rounded-xl shadow border border-gray-200">
                    <p className="text-lg italic text-gray-600">
                      🥺 No animals found. Try adjusting your filters.
                    </p>
                </div>
              )}

              {animals.map((pet) => (
                <PetCard
                  key={pet.id}
                  pet={pet}
                  onView={(id) => navigate(`/animal/${id}`)}
                />
              ))}
            </div>
        </div>
      </div>
    </div>
  );
}