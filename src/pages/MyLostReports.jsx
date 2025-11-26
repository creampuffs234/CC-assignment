// src/pages/MyLostReports.jsx
import React, { useEffect, useState } from "react";
import supabase from "../helper/supabaseClient";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";

export default function MyLostReports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    loadReports();
  }, []);

  async function loadReports() {
    setLoading(true);

    // Get logged user
    const { data: sessionData } = await supabase.auth.getUser();
    const user = sessionData?.user;
    if (!user) return;

    setUserId(user.id);

    // Fetch user's lost pet reports
    const { data } = await supabase
      .from("pet_reports")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    setReports(data || []);
    setLoading(false);
  }

  async function deleteReport(id) {
    if (!window.confirm("Are you sure you want to remove this report?")) return;

    const { error } = await supabase.from("pet_reports").delete().eq("id", id);

    if (error) {
      alert("Failed to delete.");
      return;
    }

    alert("Report deleted.");
    loadReports();
  }

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">My Lost Pet Reports</h1>

      {reports.length === 0 && (
        <p className="text-gray-600">You have not submitted any reports.</p>
      )}

      <div className="space-y-4">
        {reports.map((r) => (
          <div
            key={r.id}
            className="border p-4 rounded shadow bg-white space-y-3"
          >
            {/* HEADER */}
            <div className="flex justify-between items-center">
              <h2 className="font-semibold text-lg">
                {r.pet_type.toUpperCase()} — LOST
              </h2>

              <span className="text-sm bg-gray-200 px-2 py-1 rounded">
                {r.status.replace("_", " ")}
              </span>
            </div>

            {/* DESCRIPTION */}
            <p className="text-gray-700">{r.description}</p>

            {/* CONTACT PHONE */}
            <p className="text-gray-800 font-semibold">
              📞 Contact:{" "}
              <span className="font-normal">
                {r.contact_phone || "Not Provided"}
              </span>
            </p>

            {/* LOCATION TEXT */}
            <p className="text-gray-600 text-sm">
              📍 Location: {r.location || "Unknown"}
            </p>

            {/* DATE */}
            <p className="text-xs text-gray-500">
              {new Date(r.created_at).toLocaleString()}
            </p>

            {/* IMAGE */}
            {r.image_url && (
              <img
                src={r.image_url}
                className="w-full h-48 object-cover rounded"
                alt="lost pet"
              />
            )}

            {/* MAP */}
            {r.latitude && r.longitude && (
              <div className="mt-3">
                <MapContainer
                  center={[r.latitude, r.longitude]}
                  zoom={15}
                  className="h-40 w-full rounded"
                >
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <Marker position={[r.latitude, r.longitude]}>
                    <Popup>Reported Location</Popup>
                  </Marker>
                </MapContainer>
              </div>
            )}

            {/* DELETE BUTTON — OWNER ONLY */}
            {userId === r.user_id && (
              <button
                onClick={() => deleteReport(r.id)}
                className="mt-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
              >
                Delete Report
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
