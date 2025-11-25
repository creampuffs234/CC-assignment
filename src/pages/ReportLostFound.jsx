// src/pages/ReportLostFound.jsx
import React, { useState } from "react";
import supabase from "../helper/supabaseClient";
import { createReport } from "../services/reportService";
import { createNotification } from "../services/notificationService";
import { getRescueTeam, sendRescueAlert } from "../services/rescueService";
import { uploadImage } from "../services/storageService";

export default function ReportLostFound() {
  const [reportType, setReportType] = useState("lost");
  const [petType, setPetType] = useState("dog");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    // ---- 1. Image Upload ----
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

    // ---- 2. Get logged user ----
    const { data: sessionData } = await supabase.auth.getUser();
    const user = sessionData?.user;

    // ---- 3. Build report payload ----
    const payload = {
      user_id: user?.id || null,
      report_type: reportType,
      pet_type: petType,
      location,
      description,
      image_url,
      status: "open",
    };

    // ---- 4. Create report ----
    const { data: report, error } = await createReport(payload);
    if (error) {
      alert("Failed to create report: " + (error.message || error));
      setSubmitting(false);
      return;
    }

    // ---- 5. Fetch rescue team ----
    const { data: rescue, error: rescueErr } = await getRescueTeam();
    if (!rescue || rescueErr) {
      console.warn("No rescue team found, skipping email");
    } else {
      // ---- 6. Create in-app notification ----
      await createNotification({
        message: `New ${report.report_type} report: ${report.pet_type || "pet"}`,
        recipient_type: "rescue",
        recipient_id: rescue.id,
        meta: { report_id: report.id, created_at: report.created_at },
      });

      // ---- 7. Email rescue using Supabase Edge Function ----
      try {
        await sendRescueAlert(report, rescue);
      } catch (e) {
        console.warn("Failed to call rescue alert edge function:", e);
      }
    }

    alert("Report submitted — rescue team notified.");
    setSubmitting(false);
  };

  return (
    <div className="p-6 max-w-lg mx-auto">
      <h2 className="text-xl font-bold mb-4">Report Lost / Found Pet</h2>

      <form onSubmit={handleSubmit} className="space-y-3">
        <select value={reportType} onChange={(e) => setReportType(e.target.value)}>
          <option value="lost">Lost</option>
          <option value="found">Found</option>
        </select>

        <input
          value={petType}
          onChange={(e) => setPetType(e.target.value)}
          placeholder="Pet type (dog, cat...)"
          className="w-full p-2 border rounded"
        />

        <input
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="Location"
          className="w-full p-2 border rounded"
        />

        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description"
          className="w-full p-2 border rounded"
        />

        <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0])} />

        <button disabled={submitting} className="bg-indigo-600 text-white px-4 py-2 rounded">
          {submitting ? "Submitting..." : "Submit Report"}
        </button>
      </form>
    </div>
  );
}
