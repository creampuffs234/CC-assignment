import React, { useState } from "react";
import supabase from "../helper/supabaseClient";
import { createAdoption } from "../services/adoptionService";

export default function AdoptionRequestForm({ animalId, animalTitle, onSuccess }) {
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);

    const { data: sessionData } = await supabase.auth.getUser();
    const user = sessionData?.user;

    const payload = {
      animal_id: animalId,
      requester_id: user?.id,
      requester_name: name || user.email,
      contact,
      message,
      status: "pending"
    };

    const { error } = await createAdoption(payload);

    if (error) {
      alert("Failed to submit adoption request.");
      setSubmitting(false);
      return;
    }

    alert("Adoption request submitted!");
    if (onSuccess) onSuccess();
    setSubmitting(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <input className="p-3 border rounded w-full" placeholder="Name" value={name} onChange={(e)=>setName(e.target.value)} />
      <input className="p-3 border rounded w-full" placeholder="Contact" value={contact} onChange={(e)=>setContact(e.target.value)} required />
      <textarea className="p-3 border rounded w-full" placeholder="Message" value={message} onChange={(e)=>setMessage(e.target.value)} />

      <button disabled={submitting} className="bg-indigo-600 text-white px-4 py-2 rounded">
        {submitting ? "Submitting..." : "Submit Request"}
      </button>
    </form>
  );
}
