// src/pages/UserPage.jsx
import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import supabase from "../helper/supabaseClient";

export default function UserPage() {
  const { id } = useParams(); // user ID from URL
  const [profile, setProfile] = useState(null);
  const [animals, setAnimals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUser();
    loadUserAnimals();
  }, [id]);

  async function loadUser() {
    const { data, error } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("id", id)
      .single();

    if (!error) {
      setProfile(data);
    }
  }

  async function loadUserAnimals() {
    const { data, error } = await supabase
      .from("animals")
      .select("*")
      .eq("owner_id", id)
      .order("created_at", { ascending: false });

    if (!error) {
      setAnimals(data || []);
    }
    setLoading(false);
  }

  if (loading) {
    return <div className="p-6">Loading profile...</div>;
  }

  if (!profile) {
    return (
      <div className="p-6 text-center">
        <h2 className="text-xl font-bold">User not found</h2>
        <p className="text-gray-500">This profile does not exist.</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">

      {/* User Info Section */}
      <div className="bg-white shadow rounded p-6 mb-6">
        <div className="flex items-center gap-4">
          <img
            src={profile.avatar_url || "https://via.placeholder.com/80"}
            alt="Profile"
            className="w-20 h-20 rounded-full object-cover border"
          />

          <div>
            <h2 className="text-2xl font-bold">
              {profile.full_name || "Unnamed User"}
            </h2>

            <p className="text-gray-600">{profile.location || "Unknown location"}</p>

            {profile.phone && (
              <p className="text-gray-700 mt-1">📞 {profile.phone}</p>
            )}
          </div>
        </div>

        {profile.bio && (
          <p className="mt-4 text-gray-700">{profile.bio}</p>
        )}
      </div>

      {/* User's Posted Pets */}
      <h3 className="text-xl font-bold mb-3">
        {profile.full_name || "User"}’s Pets for Adoption
      </h3>

      {animals.length === 0 ? (
        <p className="text-gray-600">No animals posted by this user.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {animals.map((pet) => (
            <Link
              key={pet.id}
              to={`/animal/${pet.id}`}
              className="bg-white shadow rounded p-4 block hover:shadow-lg transition"
            >
              <img
                src={pet.image_url}
                alt={pet.title}
                className="w-full h-40 object-cover rounded mb-3"
              />
              <h4 className="font-semibold text-lg">{pet.title}</h4>
              <p className="text-sm text-gray-600">
                {pet.species} • {pet.breed || "Unknown breed"}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
