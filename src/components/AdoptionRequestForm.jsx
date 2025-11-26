// src/components/AdoptionRequestForm.jsx (Updated Styling)
import React, { useState } from "react";
import supabase from "../helper/supabaseClient";
import { createAdoption } from "../services/adoptionService";
import { createNotification } from "../services/notificationService";

/**
 * Props:
 * - animalId (uuid)
 * - animalTitle (string)
 * - onSuccess() optional callback after successful request
 */
export default function AdoptionRequestForm({ animalId, animalTitle, onSuccess }) {
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // --- FUNCTIONAL LOGIC (STRICTLY UNCHANGED) ---
  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);

    // get current user
    const { data: sessionData } = await supabase.auth.getUser();
    const user = sessionData?.user;

    const payload = {
      animal_id: animalId,
      requester_id: user?.id || null,
      requester_name: name || user?.email || "Anonymous",
      contact: contact || "",
      message: message || "",
    };

    const { data, error } = await createAdoption(payload);

    if (error) {
      console.error("createAdoption error:", error);
      alert("Failed to submit adoption request.");
      setSubmitting(false);
      return;
    }

    // notify shelter (createNotification)
    // payload.meta contains adoption id & animal title
    try {
      await createNotification({
        recipient_id: data.shelter_id,
        recipient_type: "shelter",
        type: "adoption_request",
        message: `New adoption request for ${animalTitle || "a pet"}.`,
        meta: { adoption_id: data.id, animal_id: data.animal_id, animal_title: animalTitle },
      });
    } catch (e) {
      console.warn("notification failed", e);
    }

    alert("Adoption request submitted.");
    setSubmitting(false);
    setName("");
    setContact("");
    setMessage("");
    if (onSuccess) onSuccess();
  }
  // --- END FUNCTIONAL LOGIC ---

  // UI Classes
  const inputClass = "w-full p-3 border border-gray-600 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:ring-indigo-500 focus:border-indigo-500 shadow-inner transition duration-150";
  const labelClass = "block text-sm font-medium text-gray-300 mb-1";
  const buttonBaseClass = "w-full px-4 py-3 rounded-lg font-bold transition duration-200 shadow-md";

  return (
    // Form placed in a styled container for context (assuming it will be wrapped in a card/modal)
    <div className="bg-gray-800 p-6 sm:p-8 rounded-xl border border-indigo-700/50">
        <h3 className="text-2xl font-bold text-indigo-400 mb-6 border-b border-gray-700 pb-3">
            Apply to Adopt {animalTitle || "This Pet"}
        </h3>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Your Name */}
          <div>
            <label className={labelClass}>Your Full Name</label>
            <input 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                className={inputClass} 
                placeholder="Full name (for the shelter's record)" 
            />
          </div>

          {/* Contact */}
          <div>
            <label className={labelClass}>Contact (Phone or Email) <span className="text-red-400">*</span></label>
            <input 
                value={contact} 
                onChange={(e) => setContact(e.target.value)} 
                className={inputClass} 
                placeholder="Required for follow-up" 
                required 
            />
          </div>

          {/* Message */}
          <div>
            <label className={labelClass}>Message to the Shelter (Tell your story!)</label>
            <textarea 
                value={message} 
                onChange={(e) => setMessage(e.target.value)} 
                className={inputClass + " resize-none"} 
                rows={4} 
                placeholder="Why would you be the best home for this pet? (e.g., experience, living situation, etc.)" 
            />
          </div>

          {/* Submit Button */}
          <button 
            type="submit" 
            disabled={submitting} 
            className={`${buttonBaseClass} ${
              submitting 
                ? "bg-gray-600 text-gray-400 cursor-not-allowed" 
                : "bg-indigo-600 text-white hover:bg-indigo-500 shadow-indigo-500/50"
            }`}
          >
            {submitting ? "Submitting Request..." : "Request Adoption"}
          </button>
        </form>
    </div>
  );
}