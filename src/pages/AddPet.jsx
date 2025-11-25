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

    // 1. Upload image if exists
    let image_url = null;
    if (file) {
      const { publicUrl, error } = await uploadImage(file);
      if (error) {
        alert(error);
        return;
      }
      image_url = publicUrl;
    }

    // 2. Get logged-in user
    const { data: sessionData } = await supabase.auth.getUser();
    const user = sessionData?.user;

    if (!user) {
      alert("You must be logged in to post an animal.");
      return;
    }

    // 3. Fetch user profile (full_name, phone, avatar_url)
    const { data: profile } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();

    // 4. OPTIONAL: Try to fetch shelter (do NOT block user)
    const { data: shelter } = await supabase
      .from("shelters")
      .select("id")
      .eq("admin_user_id", user.id)
      .maybeSingle();

    // 5. Build payload with USER PROFILE + optional shelter
    const payload = {
      title,
      description,
      species,
      breed,
      age,
      gender,
      image_url,

      // Owner info
      owner_id: user.id,
      owner_email: user.email,
      owner_full_name: profile?.full_name || null,
      owner_phone: profile?.phone || null,
      owner_avatar: profile?.avatar_url || null,

      // Optional shelter
      shelter_id: shelter?.id || null,
    };

    // 6. Insert into animals table
    const { error } = await createAnimal(payload);

    if (error) {
      alert(error.message || "Error creating animal listing.");
      return;
    }

    alert("Pet posted for adoption!");
    navigate("/marketplace");
  };

  return (
    <div className="p-6 max-w-lg mx-auto">
      <h2 className="text-xl font-bold mb-4">Post an Animal for Adoption</h2>
      
      <form onSubmit={handleSubmit} className="space-y-3">

        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title"
          className="w-full p-2 border rounded"
          required
        />

        <select
          value={species}
          onChange={(e) => setSpecies(e.target.value)}
          className="w-full p-2 border rounded"
        >
          <option value="dog">Dog</option>
          <option value="cat">Cat</option>
        </select>

        <input
          value={breed}
          onChange={(e) => setBreed(e.target.value)}
          placeholder="Breed"
          className="w-full p-2 border rounded"
        />

        <input
          value={age}
          onChange={(e) => setAge(e.target.value)}
          placeholder="Age"
          className="w-full p-2 border rounded"
        />

        <input
          value={gender}
          onChange={(e) => setGender(e.target.value)}
          placeholder="Gender"
          className="w-full p-2 border rounded"
        />

        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description"
          className="w-full p-2 border rounded"
        />

        <input
          type="file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files?.[0])}
        />

        <button className="bg-indigo-600 text-white px-4 py-2 rounded">
          Post Animal
        </button>
      </form>
    </div>
  );
}
