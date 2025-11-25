// src/components/PetCard.jsx
import React from "react";
import { Link } from "react-router-dom";

export default function PetCard({ pet, onView }) {
  // Determine adoption badge
  const status = pet.adoption_status || "open";

  const badgeMap = {
    open: { text: "Open to Adopt", color: "bg-green-600" },
    pending: { text: "Pending Adoption", color: "bg-yellow-500 text-black" },
    approved: { text: "Adopted", color: "bg-gray-600" },
  };

  const badge = badgeMap[status] || badgeMap.open;

  // Is shelter or user
  const isShelterPost = pet.shelter_id !== null;

  return (
    <div
      onClick={() => onView(pet.id)}
      className="relative bg-white rounded-xl shadow hover:shadow-xl transition overflow-hidden cursor-pointer"
    >
      {/* Pet image */}
      <div className="w-full h-48 bg-gray-200">
        <img
          src={pet.image_url || "/placeholder.jpg"}
          alt={pet.title || `${pet.species} ${pet.breed}`}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Status badge */}
      <span
        className={`absolute top-3 left-3 px-2 py-1 text-xs font-semibold text-white rounded ${badge.color}`}
      >
        {badge.text}
      </span>

      {/* 🛡️ Upgraded Shelter/User Badge */}
      <span
        className={`
          absolute top-3 right-3 px-3 py-1 flex items-center gap-1 
          text-xs font-semibold rounded-full shadow-md
          ${
            isShelterPost
              ? "bg-gradient-to-r from-blue-500 to-blue-700 text-white"
              : "bg-purple-600 text-white"
          }
        `}
      >
        {isShelterPost ? (
          <>
            <span className="text-xs">🛡️</span> Verified Shelter
          </>
        ) : (
          <>
            <span className="text-xs">👤</span> User Post
          </>
        )}
      </span>

      {/* Body */}
      <div className="p-4">

        <h3 className="text-lg font-bold text-gray-900">
          {pet.title || `${pet.species} • ${pet.breed}`}
        </h3>

        <p className="text-sm text-gray-600 mt-1">
          {pet.breed} • {pet.age || "Age unknown"}
        </p>

        {/* Poster info (CLICKABLE USER LINK) */}
        <div className="flex items-center gap-3 mt-4">
          <img
            src={pet.owner_avatar || "https://via.placeholder.com/40"}
            alt="owner"
            className="w-8 h-8 rounded-full object-cover border"
          />

          <div className="text-sm">
            <Link 
              to={`/user/${pet.owner_id}`}
              onClick={(e) => e.stopPropagation()}   // prevents opening pet details
              className="font-medium text-indigo-600 hover:underline"
            >
              {pet.owner_full_name || "Unknown User"}
            </Link>

            <p className="text-gray-500 text-xs">{pet.owner_email}</p>
          </div>
        </div>

        {/* Bottom row */}
        <div className="mt-4 flex justify-between items-center">
          <span className="text-sm text-indigo-600 font-medium">
            View details →
          </span>
          <span className="text-xs text-gray-500">
            {pet.created_at
              ? new Date(pet.created_at).toLocaleDateString()
              : ""}
          </span>
        </div>
      </div>
    </div>
  );
}
