// src/pages/AnimalDetails.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getAnimalById } from "../services/animalService";
import AdoptionRequestForm from "../components/AdoptionRequestForm";

export default function AnimalDetails() {
  const { id } = useParams();
  const [animal, setAnimal] = useState(null);
  const [showRequest, setShowRequest] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      const { data, error } = await getAnimalById(id);
      if (error) {
        console.error(error);
        return;
      }
      setAnimal(data);
    };
    load();
  }, [id]);

  if (!animal) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="bg-white rounded-xl shadow p-6">
        <img src={animal.image_url || "/placeholder.jpg"} alt={animal.title} className="w-full h-64 object-cover rounded" />
        <h1 className="text-2xl font-bold mt-4">{animal.title}</h1>
        <p className="text-gray-600">{animal.species} • {animal.breed} • {animal.age}</p>
        <p className="mt-4">{animal.description}</p>

        <div className="mt-6 flex gap-3">
          <button onClick={() => setShowRequest(true)} className="bg-indigo-600 text-white px-4 py-2 rounded">Request Adoption</button>
          <button onClick={() => navigate(-1)} className="px-4 py-2 border rounded">Back</button>
        </div>

        {animal.shelters && (
          <div className="mt-6 p-4 border rounded">
            <h3 className="font-semibold">Shelter</h3>
            <p>{animal.shelters.name}</p>
            <p>{animal.shelters.phone}</p>
            <p>{animal.shelters.address}</p>
          </div>
        )}

        {animal.owner_name && (
          <div className="mt-4 text-sm text-gray-600">Posted by: {animal.owner_name}</div>
        )}
      </div>

      {/* Request modal (simple) */}
      {showRequest && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg w-full max-w-xl p-6 relative">
            <button onClick={() => setShowRequest(false)} className="absolute top-3 right-3 text-gray-500">Close</button>
            <h3 className="text-xl font-bold mb-3">Request Adoption — {animal.title}</h3>

            <AdoptionRequestForm
              animalId={animal.id}
              animalTitle={animal.title}
              onSuccess={() => setShowRequest(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
