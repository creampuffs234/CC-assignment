// src/pages/AddPet.jsx
import React, { useState } from "react";
import { createAnimal } from "../services/animalService";
import { uploadImage } from "../services/storageService";
import supabase from "../helper/supabaseClient";
import { useNavigate } from "react-router-dom";

export default function AddPet() {
  const [title, setTitle] = useState("");
  const [species, setSpecies] = useState("dog");
  const [breed, setBreed] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    let image_url = null;
    if (file) {
      const { publicUrl, error } = await uploadImage(file);
      if (error) {
        alert(error);
        return;
      }
      image_url = publicUrl;
    }

    // Auth user
    const { data: sessionData } = await supabase.auth.getUser();
    const user = sessionData?.user;

    if (!user) {
      alert("You must be logged in to post a pet.");
      return;
    }

    // Fetch user profile (for name, phone, avatar)
    const { data: profile } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();

    // Fetch shelter (if user is a shelter admin)
    const { data: shelter } = await supabase
      .from("shelters")
      .select("*")
      .eq("admin_user_id", user.id)
      .maybeSingle();

    // FINAL PAYLOAD — MATCHES YOUR DATABASE EXACTLY
    const payload = {
      title,
      species,
      breed,
      age,
      gender,
      description,
      image_url,
      is_active: true,

      // Owner fields (VALID)
      owner_id: user.id,
      owner_name: profile?.full_name || null,
      owner_email: user.email,
      owner_phone: profile?.phone || null,
      owner_avatar: profile?.avatar_url || null,

      // Shelter fields (VALID)
      shelter_id: shelter?.id || null,
      shelter_name: shelter?.name || null,
      shelter_email: shelter?.email || null,

      adoption_status: "available",
    };

    const { data, error } = await createAnimal(payload);

    if (error) {
      console.error(error);
      alert(error.message || "Error creating pet listing.");
      return;
    }

    alert("Pet posted successfully!");
    navigate("/marketplace");
  };

  return (
    <div className="min-h-screen py-10 px-4 bg-gray-100">
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-xl p-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-6 border-b pb-3">
          🐾 Post an Animal for Adoption
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* TITLE */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">Pet Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg"
              required
            />
          </div>

          {/* SPECIES */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">Species</label>
            <select
              value={species}
              onChange={(e) => setSpecies(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg"
            >
              <option value="dog">Dog</option>
              <option value="cat">Cat</option>
            </select>
          </div>

          {/* BREED */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">Breed</label>
            <input
              value={breed}
              onChange={(e) => setBreed(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg"
            />
          </div>

          {/* AGE & GENDER */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700">Age</label>
              <input
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-gray-700">Gender</label>
              <input
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg"
              />
            </div>
          </div>

          {/* DESCRIPTION */}
          <div>
            <label className="block text-gray-700">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg min-h-[120px]"
            />
          </div>

          {/* IMAGE UPLOAD */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">Pet Image</label>
            <div className="w-full border-2 border-dashed border-gray-300 rounded-xl p-6 bg-gray-50 text-center">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setFile(e.target.files?.[0])}
                className="hidden"
                id="petImage"
              />
              <label htmlFor="petImage" className="cursor-pointer">
                {file ? file.name : "Click to upload an image"}
              </label>
            </div>
          </div>

          <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg">
            Post Animal
          </button>
        </form>
      </div>
    </div>
  );
}
