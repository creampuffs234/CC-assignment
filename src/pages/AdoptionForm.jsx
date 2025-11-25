// src/pages/AdoptionForm.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import supabase from "../helper/supabaseClient";
import { createAdoption } from "../services/adoptionService";

export default function AdoptionForm() {
  const { id } = useParams(); // animal ID
  const navigate = useNavigate();

  const [animal, setAnimal] = useState(null);
  const [message, setMessage] = useState("");
  const [contact, setContact] = useState("");

  // Load animal details to extract shelter_id
  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("animals")
        .select("*")
        .eq("id", id)
        .single();

      setAnimal(data);
    };
    load();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { data: sessionData } = await supabase.auth.getUser();
    const user = sessionData?.user;

    if (!user) {
      alert("Login required to adopt.");
      return;
    }

    if (!animal?.shelter_id) {
      alert("This pet is not assigned to any shelter. Adoption cannot continue.");
      return;
    }

    // 1. Create adoption record in DB
    const { data, error } = await createAdoption({
      animal_id: id,
      shelter_id: animal.shelter_id,
      requester_id: user.id,
      requester_name: user.email,
      contact,
      message,
    });

    if (error) {
      alert("Adoption request error: " + error.message);
      return;
    }

    // 2. Update animal adoption status = pending
    await supabase
      .from("animals")
      .update({ adoption_status: "pending" })
      .eq("id", id);

    // 3. Call Edge Function to send email
    await supabase.functions.invoke("adoption-email", {
      body: {
        adoptionId: data.id,
        animal: { id, title: animal.title },
        shelter: { id: animal.shelter_id, email: animal.shelter_email, name: animal.shelter_name },
        requester: { id: user.id, name: user.email, contact },
        message,
      },
    });

    alert("Adoption request submitted!");
    navigate("/dashboard");
  };

  if (!animal) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6 max-w-lg mx-auto">
      <h2 className="text-xl font-bold mb-4">
        Adopt: {animal.title}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-3">
        <textarea
          className="w-full border p-2 rounded"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Why do you want to adopt this pet?"
          required
        />
        <input
          className="w-full border p-2 rounded"
          value={contact}
          onChange={(e) => setContact(e.target.value)}
          placeholder="Your contact number"
          required
        />
        <button className="bg-blue-600 text-white px-4 py-2 rounded">
          Submit Adoption Request
        </button>
      </form>
    </div>
  );
}
