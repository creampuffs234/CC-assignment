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

    // Get logged in user
    const { data: auth } = await supabase.auth.getUser();
    const user = auth?.user;
    if (!user) {
      alert("You must be logged in.");
      return;
    }

    // Get shelter row for this user
    const { data: shelter } = await supabase
      .from("shelters")
      .select("*")
      .eq("admin_user_id", user.id)
      .maybeSingle();

    if (!shelter) {
      alert("Only shelters can publish animals.");
      return;
    }

    // Upload image if exists
    let image_url = null;
    if (file) {
      const { publicUrl, error } = await uploadImage(file);
      if (error) {
        alert(error);
        return;
      }
      image_url = publicUrl;
    }

    // Insert new animal
    const payload = {
      title,
      species,
      breed,
      age,
      gender,
      description,
      image_url,
      is_active: true,

      shelter_id: shelter.id,
      shelter_name: shelter.name,
      shelter_email: shelter.email,

      owner_id: user.id,
      owner_name: user.email,

      adoption_status: "open",
    };

    const { error } = await createAnimal(payload);

    if (error) {
      console.error(error);
      alert(error.message);
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

          <div>
            <label className="font-medium">Pet Title</label>
            <input
              className="w-full p-3 border rounded"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="font-medium">Species</label>
            <select
              className="w-full p-3 border rounded"
              value={species}
              onChange={(e) => setSpecies(e.target.value)}
            >
              <option value="dog">Dog</option>
              <option value="cat">Cat</option>
            </select>
          </div>

          <div>
            <label className="font-medium">Breed</label>
            <input
              className="w-full p-3 border rounded"
              value={breed}
              onChange={(e) => setBreed(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="font-medium">Age</label>
              <input
                className="w-full p-3 border rounded"
                value={age}
                onChange={(e) => setAge(e.target.value)}
              />
            </div>
            <div>
              <label className="font-medium">Gender</label>
              <input
                className="w-full p-3 border rounded"
                value={gender}
                onChange={(e) => setGender(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="font-medium">Description</label>
            <textarea
              className="w-full p-3 border rounded min-h-[120px]"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div>
            <label className="font-medium">Pet Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setFile(e.target.files?.[0])}
              className="w-full p-3 border rounded"
            />
          </div>

          <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg">
            Post Animal
          </button>
        </form>
      </div>
    </div>
  );
}
