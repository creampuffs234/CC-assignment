// src/pages/UserPage.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import supabase from "../helper/supabaseClient";
import { uploadImage } from "../services/storageService";

export default function UserPage() {
  const { id } = useParams(); // viewing profile
  const [profile, setProfile] = useState(null);
  const [animals, setAnimals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);

  // Editable fields
  const [fullName, setFullName] = useState("");
  const [location, setLocation] = useState("");
  const [bio, setBio] = useState("");
  const [phone, setPhone] = useState("");
  const [avatar, setAvatar] = useState(null); // local file
  const [avatarPreview, setAvatarPreview] = useState("");

  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    loadPage();
  }, [id]);

  async function loadPage() {
    // Check if logged user is owner
    const { data: session } = await supabase.auth.getUser();
    const loggedUser = session?.user;
    setIsOwner(loggedUser?.id === id);

    // Load Profile
    const { data: profileData } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (profileData) {
      setProfile(profileData);
      setFullName(profileData.full_name || "");
      setLocation(profileData.location || "");
      setBio(profileData.bio || "");
      setPhone(profileData.phone || "");
      setAvatarPreview(profileData.avatar_url);
    }

    // Load user animals
    const { data: animalsData } = await supabase
      .from("animals")
      .select("*")
      .eq("owner_id", id)
      .order("created_at", { ascending: false });

    setAnimals(animalsData || []);

    setLoading(false);
  }

  async function handleSave() {
    let avatar_url = profile.avatar_url;

    // Upload avatar if user selected a new file
    if (avatar) {
      const { publicUrl, error } = await uploadImage(avatar);
      if (!error) avatar_url = publicUrl;
    }

    const { data, error } = await supabase
      .from("user_profiles")
      .update({
        full_name: fullName,
        location,
        bio,
        phone,
        avatar_url,
      })
      .eq("id", id);

    if (!error) {
      alert("Profile updated!");
      setEditing(false);
      loadPage();
    } else {
      alert("Failed to update profile.");
    }
  }

  if (loading) return <div className="p-6">Loading profile...</div>;

  if (!profile)
    return (
      <div className="p-6 text-center">
        <h2 className="text-xl font-bold">User not found</h2>
      </div>
    );

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* HEADER */}
      <div className="bg-white shadow rounded p-6 mb-6">
        <div className="flex items-center gap-4">
          {/* Avatar */}
          <label className="cursor-pointer">
            <img
              src={avatarPreview || "https://via.placeholder.com/80"}
              alt="Profile"
              className="w-20 h-20 rounded-full object-cover border"
            />
            {isOwner && editing && (
              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={(e) => {
                  setAvatar(e.target.files[0]);
                  setAvatarPreview(URL.createObjectURL(e.target.files[0]));
                }}
              />
            )}
          </label>

          {/* User Info */}
          <div>
            {editing ? (
              <>
                <input
                  className="border p-2 rounded w-full"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
                <input
                  className="border p-2 rounded w-full mt-2"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Location"
                />
                <input
                  className="border p-2 rounded w-full mt-2"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Phone"
                />
              </>
            ) : (
              <>
                <h2 className="text-2xl font-bold">{profile.full_name}</h2>
                <p className="text-gray-600">{profile.location}</p>
                {profile.phone && (
                  <p className="text-gray-700 mt-1">📞 {profile.phone}</p>
                )}
              </>
            )}
          </div>
        </div>

        {/* Bio */}
        {editing ? (
          <textarea
            className="border p-2 rounded w-full mt-4"
            rows={4}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Write a short bio..."
          />
        ) : (
          profile.bio && <p className="mt-4 text-gray-700">{profile.bio}</p>
        )}

        {/* EDIT BUTTONS */}
        {isOwner && (
          <div className="mt-4">
            {!editing ? (
              <button
                className="bg-indigo-600 text-white px-4 py-2 rounded"
                onClick={() => setEditing(true)}
              >
                Edit Profile
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  className="bg-green-600 text-white px-4 py-2 rounded"
                  onClick={handleSave}
                >
                  Save
                </button>

                <button
                  className="bg-gray-500 text-white px-4 py-2 rounded"
                  onClick={() => setEditing(false)}
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* PETS SECTION */}
      <h3 className="text-xl font-bold mb-3">
        {profile.full_name}'s Pets for Adoption
      </h3>

      {animals.length === 0 ? (
        <p className="text-gray-600">No animals posted.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {animals.map((pet) => (
            <div
              key={pet.id}
              className="bg-white rounded shadow p-4 hover:shadow-lg"
            >
              <img
                src={pet.image_url}
                className="w-full h-40 object-cover rounded"
              />
              <h4 className="font-semibold mt-2">{pet.title}</h4>
              <p className="text-sm text-gray-600">
                {pet.species} • {pet.breed}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
