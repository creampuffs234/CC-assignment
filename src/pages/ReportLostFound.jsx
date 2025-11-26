// src/pages/ReportLostFound.jsx
import React, { useState } from "react";
import supabase from "../helper/supabaseClient";
import { createReport } from "../services/reportService";
import { createNotification } from "../services/notificationService";
import { uploadImage } from "../services/storageService";
import { sendRescueAlert } from "../services/rescueService";
import { getClosestShelter } from "../services/shelterLocator";
import MapPicker from "../components/MapPicker";

export default function ReportLostFound() {
  const [petType, setPetType] = useState("dog");
  const [locationText, setLocationText] = useState("");
  const [description, setDescription] = useState("");
  const [phone, setPhone] = useState(""); // NEW FIELD
  const [file, setFile] = useState(null);
  const [coords, setCoords] = useState(null); 
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    // ----- Validate map coordinates -----
    if (!coords) {
      alert("Please select a location on the map.");
      setSubmitting(false);
      return;
    }

    // ----- Image upload -----
    let image_url = null;
    if (file) {
      const { publicUrl, error } = await uploadImage(file);
      if (error) {
        alert(error);
        setSubmitting(false);
        return;
      }
      image_url = publicUrl;
    }

    // ----- Logged user -----
    const { data: sessionData } = await supabase.auth.getUser();
    const user = sessionData?.user;

    // ----- Closest shelter -----
    const nearestShelter = await getClosestShelter(coords.lat, coords.lng);
    if (!nearestShelter) {
      alert("No shelters found with location data.");
      setSubmitting(false);
      return;
    }

    // ----- Build report payload -----
    const payload = {
      user_id: user?.id || null,
      report_type: "lost",
      pet_type: petType,
      location: locationText,
      description,
      contact_phone: phone,           // NEW FIELD
      image_url,
      status: "open",
      latitude: coords.lat,
      longitude: coords.lng,
      assigned_shelter_id: nearestShelter.id,
    };

    // ----- Submit report -----
    const { data: report, error: reportErr } = await createReport(payload);
    if (reportErr) {
      console.error("SUPABASE INSERT ERROR:", reportErr);
      alert("Failed to submit report.");
      setSubmitting(false);
      return;
    }

    // ----- Notify shelter -----
    await createNotification({
      message: `Lost pet reported near your shelter.`,
      recipient_type: "shelter",
      recipient_id: nearestShelter.id,
      meta: { report_id: report.id, created_at: report.created_at },
    });

    // ----- Email shelter (edge function) -----
    try {
      await sendRescueAlert(report, nearestShelter);
    } catch (err) {
      console.warn("Email failed:", err);
    }

    alert("Lost pet report submitted. The nearest shelter has been notified.");
    setSubmitting(false);
  };

  return (
    <div className="p-6 max-w-lg mx-auto">
      <h2 className="text-2xl font-bold mb-4 text-red-600">
        Report a Lost Pet
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">

        {/* PET TYPE */}
        <input
          value={petType}
          onChange={(e) => setPetType(e.target.value)}
          placeholder="Pet type (dog, cat...)"
          className="w-full p-2 border rounded"
          required
        />

        {/* PHONE NUMBER */}
        <input
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="Your Contact Phone Number"
          className="w-full p-2 border rounded"
          required
        />

        {/* LOCATION TEXT */}
        <input
          value={locationText}
          onChange={(e) => setLocationText(e.target.value)}
          placeholder="Location (Street, area...)"
          className="w-full p-2 border rounded"
          required
        />

        {/* MAP PICKER */}
        <div>
          <label className="block text-sm font-semibold mb-2">
            📍 Select Exact Location on Map
          </label>

          <MapPicker onSelect={(loc) => setCoords(loc)} />

          {coords && (
            <p className="text-xs mt-1 text-green-700">
              Selected: {coords.lat.toFixed(5)}, {coords.lng.toFixed(5)}
            </p>
          )}
        </div>

        {/* DESCRIPTION */}
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe the situation..."
          className="w-full p-2 border rounded"
          rows={3}
          required
        />

        {/* IMAGE UPLOAD */}
        <div>
          <label className="text-sm">Upload Image (Optional)</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setFile(e.target.files?.[0])}
            className="block mt-1"
          />
        </div>

        {/* SUBMIT */}
        <button
          disabled={submitting}
          className="w-full bg-red-600 text-white p-3 rounded shadow hover:bg-red-700 transition"
        >
          {submitting ? "Submitting..." : "Submit Lost Report"}
        </button>
      </form>
    </div>
  );
}
