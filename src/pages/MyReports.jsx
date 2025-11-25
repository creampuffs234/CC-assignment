// src/pages/MyReports.jsx
import React, { useEffect, useState } from "react";
import supabase from "../helper/supabaseClient";
import { fetchReportById } from "../services/reportService";

export default function MyReports() {
  const [reports, setReports] = useState([]);

  useEffect(() => {
    const load = async () => {
      const { data: sessionData } = await supabase.auth.getUser();
      const user = sessionData?.user;
      if (!user) return;
      const { data, error } = await supabase
        .from("pet_reports")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (!error) setReports(data || []);
    };
    load();
  }, []);

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h2 className="text-xl font-bold mb-4">My Reports</h2>
      {reports.length === 0 ? <p>No reports yet.</p> : (
        <div className="space-y-4">
          {reports.map(r => (
            <div key={r.id} className="bg-white p-4 rounded shadow">
              <div className="flex justify-between">
                <div>
                  <h3 className="font-semibold">{r.pet_type} — {r.report_type}</h3>
                  <p className="text-sm text-gray-600">{r.location}</p>
                </div>
                <div>
                  <span className="text-sm">{r.status}</span>
                </div>
              </div>
              <p className="mt-2 text-sm">{r.description}</p>
              <div className="mt-2 text-xs text-gray-500">Submitted: {new Date(r.created_at).toLocaleString()}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
