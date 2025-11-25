// src/components/FilterBar.jsx
import React, { useEffect, useState } from "react";
import { fetchBreedsBySpecies } from "../services/animalService";

export default function FilterBar({ species, setSpecies, breed, setBreed, onFilter, onReset }) {
  const [breedOptions, setBreedOptions] = useState([]);

  useEffect(() => {
    const loadBreeds = async () => {
      if (!species) {
        setBreedOptions([]);
        return;
      }
      const { data } = await fetchBreedsBySpecies(species);
      setBreedOptions(data || []);
    };
    loadBreeds();
  }, [species]);

  return (
    <div className="flex gap-3 items-center mb-6">
      <select value={species} onChange={(e) => setSpecies(e.target.value)} className="p-2 border rounded">
        <option value="">All species</option>
        <option value="cat">Cat</option>
        <option value="dog">Dog</option>
      </select>

      <select value={breed} onChange={(e) => setBreed(e.target.value)} className="p-2 border rounded">
        <option value="">All breeds</option>
        {breedOptions.map((b) => <option key={b} value={b}>{b}</option>)}
      </select>

      <input placeholder="Search title/desc" className="p-2 border rounded" id="filterSearch" />

      <button
        onClick={() => {
          const search = document.getElementById("filterSearch")?.value || "";
          onFilter({ species, breed, search });
        }}
        className="bg-indigo-600 text-white px-4 py-2 rounded"
      >
        Filter
      </button>

      <button onClick={onReset} className="px-3 border rounded">Reset</button>
    </div>
  );
}
