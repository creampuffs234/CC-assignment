// src/pages/LostReports.jsx (Updated Styling)
import React, { useEffect, useState } from "react";
import supabase from "../helper/supabaseClient";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";

export default function LostReports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- FUNCTIONAL LOGIC (UNCHANGED) ---
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
  // --- END FUNCTIONAL LOGIC ---
  
  // Custom Status Badge component for cleaner rendering
  const StatusBadge = ({ status }) => {
    let colorClass = "bg-gray-700 text-gray-300";
    if (status === "open") {
      colorClass = "bg-red-700 text-red-100 font-bold";
    } else if (status === "in_progress") {
      colorClass = "bg-yellow-500 text-gray-900 font-bold";
    } else if (status === "rescued") {
      colorClass = "bg-green-600 text-white font-bold";
    }
    
    return (
      <span
        className={`px-3 py-1 text-xs rounded-full uppercase tracking-wider ${colorClass}`}
      >
        {status.replace("_", " ")}
      </span>
    );
  };
  
  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900 text-indigo-400 text-xl font-medium">
        Loading lost pet reports...
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-900 py-10 px-4 sm:px-6 lg:px-8 text-white">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-10 border-b border-red-700 pb-4">
            <h1 className="text-4xl font-extrabold mb-2 text-red-500">
                LOST PETS ALERTS 🚨
            </h1>
            <p className="text-gray-400 text-lg">
                View the latest community reports for lost animals. Your eyes can help!
            </p>
        </div>

        {reports.length === 0 && (
          <div className="text-center py-16 bg-gray-800 rounded-xl border border-gray-700">
            <p className="text-xl text-gray-400">
                No active lost reports found. Everything is safe (for now)!
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {reports.map((r) => (
            <div
              key={r.id}
              // Card Styling: High contrast, prominent border
              className="bg-gray-800 border border-red-800 p-5 rounded-2xl shadow-xl transition duration-300 hover:border-red-500 hover:shadow-red-900/40 flex flex-col"
            >
                
              {/* Pet Image (If Available) */}
              {r.image_url && (
                <img
                  src={r.image_url}
                  alt={`Lost pet: ${r.pet_type}`}
                  className="w-full h-48 object-cover rounded-xl mb-4 border border-gray-700"
                />
              )}

              <div className="flex justify-between items-center mb-3">
                <h2 className="text-2xl font-bold text-red-400">
                    {r.pet_type || "Unknown Pet"}
                </h2>
                <StatusBadge status={r.status} />
              </div>

              {/* Description and Metadata */}
              <p className="text-base text-gray-300 mb-3 flex-grow">
                  {r.description || "No detailed description provided."}
              </p>
              
              <div className="text-xs text-gray-500 space-y-1 mb-4 border-t border-gray-700 pt-3">
                  <p className="font-medium text-gray-400">
                      Location: <span className="text-white">{r.location || "N/A"}</span>
                  </p>
                  <p>
                      Reported: {new Date(r.created_at).toLocaleString()}
                  </p>
              </div>


              {/* Map (If Coordinates Available) */}
              {r.latitude && r.longitude && (
                <div className="mt-2 mb-4 rounded-xl overflow-hidden border border-gray-700">
                  <MapContainer
                    center={[r.latitude, r.longitude]}
                    zoom={15}
                    scrollWheelZoom={false}
                    // Ensure the map container has a defined height
                    className="h-48 w-full z-0" 
                  >
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    <Marker position={[r.latitude, r.longitude]}>
                      <Popup>Last Seen Here</Popup>
                    </Marker>
                  </MapContainer>
                </div>
              )}

              {/* Contact Owner Button */}
              {r.user_id && (
                <button
                  onClick={() => alert("Contact owner feature coming soon")}
                  // Action button styled for urgency/interaction
                  className="w-full mt-auto bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2 rounded-xl transition duration-150 shadow-md shadow-indigo-500/50"
                >
                  Contact Owner
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}