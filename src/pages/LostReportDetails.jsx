// src/pages/LostReportDetails.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import supabase from "../helper/supabaseClient";
import { fetchStatusHistory, addRescueStatus, updateReportStatus } from "../services/rescueService";
import { createNotification } from "../services/notificationService";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";

export default function LostReportDetails() {
  const { id } = useParams(); // report id
  const [report, setReport] = useState(null);
  const [history, setHistory] = useState([]);
  const [note, setNote] = useState("");
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    load();
    // eslint-disable-next-line
  }, [id]);

  async function load() {
    const { data: r } = await supabase
      .from("pet_reports")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    setReport(r || null);

    const { data: h } = await fetchStatusHistory(id);
    setHistory(h || []);
  }

  async function changeStatus(newStatus) {
    if (!report) return;
    setUpdating(true);

    try {
      // update main report
      const { data: updated, error: upErr } = await updateReportStatus(report.id, newStatus);
      if (upErr) throw upErr;

      // add history row with note
      await addRescueStatus(report.id, newStatus, note);

      // notify user if reporter exists
      if (report.user_id) {
        await createNotification({
          message: `Update on your lost pet report: ${newStatus.replace("_", " ")}`,
          recipient_type: "user",
          recipient_id: report.user_id,
          meta: { report_id: report.id, status: newStatus, note: note || null },
        });
      }

      setNote("");
      await load();
    } catch (err) {
      console.error(err);
      alert("Failed to update status");
    } finally {
      setUpdating(false);
    }
  }

  if (!report) return <div className="p-6">Report not found</div>;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h2 className="text-2xl font-semibold mb-2">Report Details</h2>

      <div className="bg-white/5 p-4 rounded">
        <p><strong>Type:</strong> {report.pet_type}</p>
        <p><strong>Location text:</strong> {report.location}</p>
        <p className="mt-2">{report.description}</p>
        {report.image_url && (
          <img src={report.image_url} alt="report" className="w-full h-64 object-cover rounded my-3" />
        )}

        {report.latitude && report.longitude && (
          <div className="h-56 mt-2">
            <MapContainer center={[report.latitude, report.longitude]} zoom={15} className="h-full w-full rounded">
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <Marker position={[report.latitude, report.longitude]}>
                <Popup>Reported location</Popup>
              </Marker>
            </MapContainer>
          </div>
        )}
      </div>

      {/* history */}
      <div className="mt-4">
        <h3 className="font-semibold">Status History</h3>
        {history.length === 0 ? <p className="text-sm text-gray-500">No history yet.</p> : (
          <ul className="space-y-2 mt-2">
            {history.map(h => (
              <li key={h.id} className="border p-2 rounded bg-white/5">
                <div className="text-sm"><strong>{h.status}</strong> — {h.note}</div>
                <div className="text-xs text-gray-400">{new Date(h.created_at).toLocaleString()}</div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* change status (shelter only) */}
      <div className="mt-4">
        <label className="block text-sm font-medium">Add note (optional)</label>
        <input value={note} onChange={(e) => setNote(e.target.value)} className="w-full p-2 border rounded mt-1" />
        <div className="flex gap-2 mt-3">
          <button disabled={updating} onClick={() => changeStatus("in_progress")} className="bg-yellow-500 px-3 py-1 rounded">In Progress</button>
          <button disabled={updating} onClick={() => changeStatus("rescued")} className="bg-green-600 px-3 py-1 rounded">Rescued</button>
          <button disabled={updating} onClick={() => changeStatus("not_found")} className="bg-gray-600 px-3 py-1 rounded">Not Found</button>
        </div>
      </div>
    </div>
  );
}
