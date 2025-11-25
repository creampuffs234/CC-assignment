// src/pages/RescueDashboard.jsx
import React, { useEffect, useState } from "react";
import supabase from "../helper/supabaseClient";
import { getRescueTeam, addRescueStatus, updateReportStatus } from "../services/rescueService";

const STATUS_OPTIONS = ["open", "in_progress", "resolved"];

export default function RescueDashboard() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [noteText, setNoteText] = useState("");
  const [statusLoading, setStatusLoading] = useState(false);
  const [history, setHistory] = useState({}); // { reportId: [updates] }

  useEffect(() => {
    loadReports();
    // Optionally: set up realtime subscription to pet_reports table to reflect updates live
    const channel = supabase
      .channel("public:pet_reports")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "pet_reports" },
        (payload) => {
          // simple approach: reload on any change
          loadReports();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadReports() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("pet_reports")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Failed loading reports", error);
        setReports([]);
      } else {
        setReports(data || []);
      }
    } finally {
      setLoading(false);
    }
  }

  async function loadHistory(reportId) {
    // avoid refetch if we have it cached
    if (history[reportId]) return;

    const { data, error } = await supabase
      .from("rescue_status_updates")
      .select("*")
      .eq("report_id", reportId)
      .order("created_at", { ascending: false });

    if (error) {
      console.warn("Failed to fetch history for", reportId, error);
      setHistory((h) => ({ ...h, [reportId]: [] }));
    } else {
      setHistory((h) => ({ ...h, [reportId]: data || [] }));
    }
  }

  function toggleExpand(id) {
    const next = expandedId === id ? null : id;
    setExpandedId(next);
    if (next) loadHistory(next);
    setNoteText("");
  }

  async function handleUpdateStatus(reportId, newStatus) {
    setStatusLoading(true);
    try {
      // 1) update main report status
      const { data: updatedReport, error: updateErr } = await updateReportStatus(reportId, newStatus);
      if (updateErr) {
        alert("Failed to update report status: " + (updateErr.message || updateErr));
        setStatusLoading(false);
        return;
      }

      // 2) add a status update entry (note may be empty)
      const noteToSave = noteText?.trim() || `${newStatus} by rescue team`;
      const { data: statusRow, error: addErr } = await addRescueStatus(reportId, newStatus, noteToSave);
      if (addErr) {
        console.warn("Status saved on report but failed to add history row", addErr);
      }

      // 3) reload reports and history
      await loadReports();
      await loadHistory(reportId);

      // Optionally clear note after successful update
      setNoteText("");
    } catch (err) {
      console.error("Error updating status", err);
      alert("An unexpected error occurred while updating status.");
    } finally {
      setStatusLoading(false);
    }
  }

  // simple UI helpers
  function prettyDate(ts) {
    try {
      return new Date(ts).toLocaleString();
    } catch {
      return ts;
    }
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Rescue Dashboard</h2>

      {loading ? (
        <div>Loading reports…</div>
      ) : (
        <>
          {reports.length === 0 ? (
            <div className="text-gray-600">No rescue reports yet.</div>
          ) : (
            <div className="space-y-4">
              {reports.map((r) => (
                <div key={r.id} className="bg-white rounded shadow p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-baseline gap-3">
                        <h3 className="font-semibold text-lg">
                          {r.pet_type || "Pet"} — {r.report_type || "report"}
                        </h3>
                        <span className="text-xs text-gray-500">• {prettyDate(r.created_at)}</span>
                        <span className="ml-3 px-2 py-1 text-xs rounded-full"
                              style={{
                                background: r.status === "open" ? "#FFF4E5" : r.status === "in_progress" ? "#E8F4FF" : "#E8FFE8"
                              }}
                        >
                          {r.status}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600">{r.location}</div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleExpand(r.id)}
                        className="text-sm px-3 py-1 border rounded"
                      >
                        {expandedId === r.id ? "Close" : "View"}
                      </button>
                    </div>
                  </div>

                  {/* Short description */}
                  <p className="mt-3 text-sm text-gray-700">{r.description}</p>

                  {/* Expand area */}
                  {expandedId === r.id && (
                    <div className="mt-4 border-t pt-4 space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="md:col-span-1">
                          {r.image_url ? (
                            // image preview
                            <img src={r.image_url} alt="report" className="w-full rounded max-h-56 object-cover" />
                          ) : (
                            <div className="w-full h-40 flex items-center justify-center bg-gray-50 rounded text-gray-400">
                              No image
                            </div>
                          )}
                        </div>

                        <div className="md:col-span-2 space-y-3">
                          <div>
                            <div className="text-xs text-gray-500">Reported by</div>
                            <div className="text-sm">{r.user_id || "Anonymous"}</div>
                          </div>

                          <div>
                            <div className="text-xs text-gray-500">Full description</div>
                            <div className="text-sm">{r.description}</div>
                          </div>

                          <div>
                            <div className="text-xs text-gray-500">Update status</div>

                            <div className="flex gap-2 items-center mt-2">
                              <select
                                defaultValue={r.status}
                                onChange={(e) => handleUpdateStatus(r.id, e.target.value)}
                                className="border p-2 rounded"
                                disabled={statusLoading}
                              >
                                {STATUS_OPTIONS.map((s) => (
                                  <option value={s} key={s}>
                                    {s}
                                  </option>
                                ))}
                              </select>

                              <input
                                type="text"
                                placeholder="Optional note (e.g. heading to location)"
                                value={noteText}
                                onChange={(e) => setNoteText(e.target.value)}
                                className="flex-1 border p-2 rounded"
                                disabled={statusLoading}
                              />

                              <button
                                onClick={() => handleUpdateStatus(r.id, r.status)}
                                className="bg-indigo-600 text-white px-3 py-2 rounded"
                                disabled={statusLoading}
                              >
                                Save
                              </button>
                            </div>
                          </div>

                          <div>
                            <div className="text-xs text-gray-500">Status history</div>
                            <div className="mt-2">
                              {(history[r.id] || []).length === 0 ? (
                                <div className="text-sm text-gray-500">No history yet.</div>
                              ) : (
                                <ul className="space-y-2">
                                  {history[r.id].map((h) => (
                                    <li key={h.id} className="text-sm border p-2 rounded">
                                      <div className="flex justify-between">
                                        <div>
                                          <strong>{h.status}</strong> — {h.note || ""}
                                        </div>
                                        <div className="text-xs text-gray-500">{prettyDate(h.created_at)}</div>
                                      </div>
                                    </li>
                                  ))}
                                </ul>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
