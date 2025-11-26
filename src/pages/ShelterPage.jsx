// src/pages/ShelterPage.jsx
import { useEffect, useState } from "react";
import supabase from "../helper/supabaseClient";
import { useParams } from "react-router-dom";

import {
  updateReportStatus,
  addRescueStatus,
} from "../services/rescueService";

import { createNotification } from "../services/notificationService";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";

const statusColors = {
  open: "bg-red-600",
  in_progress: "bg-yellow-500",
  rescued: "bg-green-600",
  not_found: "bg-gray-500",
};

export default function ShelterPage() {
  const { id } = useParams(); // shelter admin_user_id

  const [shelter, setShelter] = useState(null);
  const [animals, setAnimals] = useState([]);
  const [reports, setReports] = useState([]);
  const [history, setHistory] = useState({}); // { reportId: [...] }
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    loadPage();
  }, [id]);

  async function loadPage() {
    setLoading(true);

    // Fetch shelter info
    const { data: s } = await supabase
      .from("shelters")
      .select("*")
      .eq("admin_user_id", id)
      .maybeSingle();

    setShelter(s);

    if (s) {
      // Load animals
      const { data: pets } = await supabase
        .from("animals")
        .select("*")
        .eq("shelter_id", s.id);

      setAnimals(pets || []);

      // Load assigned reports
      const { data: r } = await supabase
        .from("pet_reports")
        .select("*")
        .eq("assigned_shelter_id", s.id)
        .order("created_at", { ascending: false });

      setReports(r || []);

      // Load history for each report
      for (let rep of r) {
        await loadHistory(rep.id);
      }
    }

    setLoading(false);
  }

  async function loadHistory(reportId) {
    const { data } = await supabase
      .from("rescue_status_updates")
      .select("*")
      .eq("report_id", reportId)
      .order("created_at", { ascending: false });

    setHistory((prev) => ({
      ...prev,
      [reportId]: data || [],
    }));
  }

  /**
   * Update report status + rescue team history + user notification
   */
  async function updateStatus(reportId, newStatus, note = "") {
    setUpdating(true);

    try {
      // 1. Update main pet report status
      const { data: updated, error: updateErr } = await updateReportStatus(
        reportId,
        newStatus
      );
      if (updateErr) throw updateErr;

      // 2. Save history event
      await addRescueStatus(reportId, newStatus, note);

      // 3. Fetch report owner to notify them
      const { data: reportRow } = await supabase
        .from("pet_reports")
        .select("user_id, pet_type, description")
        .eq("id", reportId)
        .maybeSingle();

      if (reportRow?.user_id) {
        await createNotification({
          message: `Update on your ${reportRow.pet_type} report: ${newStatus.replace(
            "_",
            " "
          )}`,
          recipient_type: "user",
          recipient_id: reportRow.user_id,
          meta: {
            report_id: reportId,
            status: newStatus,
            note: note || null,
          },
        });
      }

      await loadPage();
    } catch (err) {
      console.error(err);
      alert("Failed to update status.");
    }

    setUpdating(false);
  }

  if (loading) return <div className="p-6 text-white">Loading…</div>;

  if (!shelter)
    return <div className="text-white p-6">Shelter not found.</div>;

  return (
    <div className="p-6 text-white max-w-4xl mx-auto">
      {/* HEADER */}
      <h1 className="text-4xl font-bold mb-2">{shelter.name}</h1>
      <p className="text-gray-300">{shelter.address}</p>
      <p className="text-gray-300 mb-6">{shelter.phone}</p>

      {/* ANIMALS SECTION */}
      <h2 className="text-2xl font-semibold mb-3">Animals Posted</h2>

      {animals.length === 0 ? (
        <p className="text-gray-400 mb-8">No animals posted yet.</p>
      ) : (
        <div className="space-y-2 mb-8">
          {animals.map((a) => (
            <div
              key={a.id}
              className="border p-3 rounded bg-white/10 shadow text-white"
            >
              <p className="font-semibold">{a.title}</p>
              <p className="text-sm text-gray-300">
                {a.species} • {a.breed}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* LOST PET REPORTS */}
      <h2 className="text-2xl font-semibold mb-3 text-red-400">
        Lost Pet Reports Assigned to Your Shelter
      </h2>

      {reports.length === 0 ? (
        <p className="text-gray-300">No assigned reports.</p>
      ) : (
        <div className="space-y-4">
          {reports.map((r) => (
            <div
              key={r.id}
              className="bg-white/10 border border-white/20 p-4 rounded-xl shadow"
            >
              {/* HEADER */}
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold">
                  {r.pet_type?.toUpperCase()} — LOST
                </h3>

                <span
                  className={`px-2 py-1 text-xs rounded ${statusColors[r.status]}`}
                >
                  {r.status.replace("_", " ")}
                </span>
              </div>

              <p className="text-sm mt-2">{r.description}</p>
              <p className="text-xs text-gray-300 mt-1">
                {r.location} • {new Date(r.created_at).toLocaleString()}
              </p>

              {/* IMAGE */}
              {r.image_url && (
                <img
                  src={r.image_url}
                  alt="lost pet"
                  className="w-full h-48 object-cover rounded mt-3"
                />
              )}

              {/* MAP */}
              {r.latitude && r.longitude && (
                <div className="mt-3">
                  <MapContainer
                    center={[r.latitude, r.longitude]}
                    zoom={15}
                    scrollWheelZoom={false}
                    className="h-40 w-full rounded"
                  >
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    <Marker position={[r.latitude, r.longitude]}>
                      <Popup>Reported location</Popup>
                    </Marker>
                  </MapContainer>
                </div>
              )}

              {/* STATUS BUTTONS */}
              <div className="mt-4 flex gap-2">
                {r.status !== "in_progress" && (
                  <button
                    disabled={updating}
                    onClick={() =>
                      updateStatus(r.id, "in_progress", "Rescue team dispatched")
                    }
                    className="bg-yellow-500 text-black px-3 py-1 rounded"
                  >
                    Mark In Progress
                  </button>
                )}

                {r.status !== "rescued" && (
                  <button
                    disabled={updating}
                    onClick={() =>
                      updateStatus(r.id, "rescued", "Pet safely located")
                    }
                    className="bg-green-600 text-white px-3 py-1 rounded"
                  >
                    Mark Rescued
                  </button>
                )}

                {r.status !== "not_found" && (
                  <button
                    disabled={updating}
                    onClick={() =>
                      updateStatus(r.id, "not_found", "Pet not found during sweep")
                    }
                    className="bg-gray-600 text-white px-3 py-1 rounded"
                  >
                    Mark Not Found
                  </button>
                )}
              </div>

              {/* HISTORY */}
              <div className="mt-4 bg-black/20 p-3 rounded">
                <h4 className="font-semibold text-sm mb-2">History</h4>

                {history[r.id]?.length === 0 && (
                  <p className="text-xs text-gray-400">No updates yet.</p>
                )}

                <ul className="space-y-2 text-xs">
                  {history[r.id]?.map((h) => (
                    <li
                      key={h.id}
                      className="border border-white/20 p-2 rounded"
                    >
                      <strong>{h.status.replace("_", " ")}</strong>
                      {h.note && ` — ${h.note}`}
                      <div className="text-gray-400">
                        {new Date(h.created_at).toLocaleString()}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
