// src/pages/LostReports.jsx
import React, { useEffect, useState } from "react";
import supabase from "../helper/supabaseClient";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";

export default function LostReports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReports();
  }, []);

  async function loadReports() {
    setLoading(true);

    const { data, error } = await supabase
      .from("pet_reports")
      .select("*")
      .eq("report_type", "lost")
      .order("created_at", { ascending: false });

    setReports(data || []);
    setLoading(false);
  }

  if (loading) return <div className="p-6">Loading lost pet reports…</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto text-white">
      <h1 className="text-3xl font-bold mb-4 text-red-400">
        Lost Pets (Community Help)
      </h1>

      {reports.length === 0 && (
        <p className="text-gray-300">No lost reports found.</p>
      )}

      <div className="space-y-4">
        {reports.map((r) => (
          <div
            key={r.id}
            className="bg-white/10 border border-white/20 p-4 rounded-xl shadow"
          >
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">{r.pet_type}</h2>
              <span
                className={`px-2 py-1 text-xs rounded ${
                  r.status === "open"
                    ? "bg-red-600"
                    : r.status === "in_progress"
                    ? "bg-yellow-500 text-black"
                    : r.status === "rescued"
                    ? "bg-green-600"
                    : "bg-gray-500"
                }`}
              >
                {r.status.replace("_", " ")}
              </span>
            </div>

            <p className="text-sm mt-2">{r.description}</p>
            <p className="text-xs text-gray-300 mt-1">
              {r.location} • {new Date(r.created_at).toLocaleString()}
            </p>

            {r.image_url && (
              <img
                src={r.image_url}
                alt="lost pet"
                className="w-full h-48 object-cover rounded mt-3"
              />
            )}

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

            {/* OPTIONAL CONTACT OWNER FEATURE */}
            {r.user_id && (
              <button
                onClick={() => alert("Contact owner feature coming soon")}
                className="mt-4 bg-blue-600 text-white px-3 py-1 rounded"
              >
                Contact Owner
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
