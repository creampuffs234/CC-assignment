// src/pages/AnimalDetails.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getAnimalById } from "../services/animalService";

export default function AnimalDetails() {
  const { id } = useParams();
  const [animal, setAnimal] = useState(null);
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

  const isShelterPost = animal.shelter_id !== null;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="bg-white rounded-xl shadow p-6">

        {/* IMAGE */}
        <img
          src={animal.image_url || "/placeholder.jpg"}
          alt={animal.title}
          className="w-full h-64 object-cover rounded"
        />

        {/* SHELTER/USER BADGE */}
        <div className="mt-3 flex justify-end">
          <span
            className={`
              px-3 py-1 flex items-center gap-1 text-xs font-semibold 
              rounded-full shadow-md
              ${
                isShelterPost
                  ? "bg-gradient-to-r from-blue-500 to-blue-700 text-white"
                  : "bg-purple-600 text-white"
              }
            `}
          >
            {isShelterPost ? (
              <>
                <span>🛡️</span> Verified Shelter
              </>
            ) : (
              <>
                <span>👤</span> User Post
              </>
            )}
          </span>
        </div>

        {/* TITLE */}
        <h1 className="text-2xl font-bold mt-4">{animal.title}</h1>
        <p className="text-gray-600">
          {animal.species} • {animal.breed} • {animal.age}
        </p>

        {/* DESCRIPTION */}
        <p className="mt-4">{animal.description}</p>

        {/* ADOPT BUTTONS */}
        <div className="mt-6 flex gap-3">
          <button
            onClick={() => navigate(`/adopt/${animal.id}`)}
            className="bg-green-600 text-white px-4 py-2 rounded"
          >
            I'm interested (Adopt)
          </button>
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 border rounded"
          >
            Back
          </button>
        </div>

        {/* SHELTER INFO */}
        {animal.shelters && (
          <div className="mt-8 p-4 border rounded bg-gray-50">
            <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
              🛡️ Shelter Information
            </h3>

            <p className="text-gray-800">{animal.shelters.name}</p>

            {animal.shelters.phone && (
              <p className="text-gray-600 mt-1">📞 {animal.shelters.phone}</p>
            )}

            {animal.shelters.address && (
              <p className="text-gray-600 mt-1">{animal.shelters.address}</p>
            )}
          </div>
        )}

        {/* USER POSTER INFO */}
        {!animal.shelter_id && (
          <div className="mt-8 p-4 border rounded bg-gray-50">
            <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
              👤 Posted By
            </h3>

            <div className="flex items-center gap-4">
              <img
                src={animal.owner_avatar || "https://via.placeholder.com/80"}
                alt="Owner avatar"
                className="w-14 h-14 rounded-full object-cover border"
              />

              <div>
                <Link
                  to={`/user/${animal.owner_id}`}
                  className="font-semibold text-indigo-600 hover:underline"
                >
                  {animal.owner_full_name || "Unknown User"}
                </Link>

                <p className="text-sm text-gray-600">{animal.owner_email}</p>

                {animal.owner_phone && (
                  <p className="text-sm text-gray-700 mt-1">
                    📞 {animal.owner_phone}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
