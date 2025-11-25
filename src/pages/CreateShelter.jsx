// src/pages/CreateShelter.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createShelterRequest } from "../services/shelterService";
import supabase from "../helper/supabaseClient";

export default function CreateShelter() {
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    const { data: auth } = await supabase.auth.getUser();
    const user = auth?.user;
    if (!user) {
      alert("You must be logged in to register a shelter.");
      setSubmitting(false);
      return;
    }

    const payload = {
      admin_user_id: user.id,
      name,
      email: user.email,
      phone,
      address,
      description,
    };

    const { data, error } = await createShelterRequest(payload);
    setSubmitting(false);

    if (error) {
      alert(error.message || "Error creating shelter request.");
      return;
    }

    alert("Shelter registration submitted. An admin will review your request.");
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="max-w-3xl w-full grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        {/* left: form */}
        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-2xl font-bold mb-4">Register your Shelter</h2>
          <p className="text-sm text-gray-600 mb-4">
            Submit your shelter for verification. An admin will review your
            application before it becomes active.
          </p>

          <form onSubmit={handleSubmit} className="space-y-3">
            <label className="block">
              <span className="text-sm font-medium">Shelter Name</span>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="mt-1 block w-full border rounded px-3 py-2 text-sm"
                placeholder="Example Shelter"
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium">Phone</span>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="mt-1 block w-full border rounded px-3 py-2 text-sm"
                placeholder="+1 555 555 555"
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium">Address</span>
              <input
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="mt-1 block w-full border rounded px-3 py-2 text-sm"
                placeholder="Street, City, Country"
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium">Description</span>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="mt-1 block w-full border rounded px-3 py-2 text-sm"
                rows={4}
                placeholder="Short description about your shelter"
              />
            </label>

            <div className="flex gap-3 mt-4">
              <button
                type="submit"
                disabled={submitting}
                className="bg-indigo-600 text-white px-4 py-2 rounded disabled:opacity-60"
              >
                {submitting ? "Submitting..." : "Submit for Review"}
              </button>

              <button
                type="button"
                onClick={() => navigate("/dashboard")}
                className="px-4 py-2 border rounded"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>

        {/* right: illustration */}
        <div className="hidden md:flex items-center justify-center">
          <img
            src="/mnt/data/b7fa9fa7-971f-42f3-91df-1a7d53e00f5a.png"
            alt="shelter"
            className="max-w-full rounded-lg shadow"
          />
        </div>
      </div>
    </div>
  );
}
