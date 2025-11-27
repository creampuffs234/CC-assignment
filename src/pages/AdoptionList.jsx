import React, { useEffect, useState } from "react";
import supabase from "../helper/supabaseClient";
import {
  fetchAdoptionsForUser,
  fetchAdoptionsForShelter,
  updateAdoptionStatus
} from "../services/adoptionService";

export default function AdoptionList() {
  const [mode, setMode] = useState("user");
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    const { data: auth } = await supabase.auth.getUser();
    const user = auth?.user;

    const { data: shelter } = await supabase
      .from("shelters")
      .select("id")
      .eq("admin_user_id", user.id)
      .maybeSingle();

    if (shelter) {
      setMode("shelter");
      const { data } = await fetchAdoptionsForShelter(shelter.id);
      setRequests(data || []);
    } else {
      setMode("user");
      const { data } = await fetchAdoptionsForUser(user.id);
      setRequests(data || []);
    }
  }

  async function approve(r) {
    await updateAdoptionStatus(r.id, { status: "approved" });
    load();
  }

  async function reject(r) {
    await updateAdoptionStatus(r.id, { status: "rejected" });
    load();
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">
        {mode === "shelter" ? "Requests for Your Shelter" : "Your Adoption Requests"}
      </h1>

      {requests.map((r) => (
        <div key={r.id} className="border p-4 rounded bg-white shadow">
          <h2 className="text-xl mb-1">{r.animals.title}</h2>
          <p>Status: {r.status}</p>
          <p>Message: {r.message}</p>

          {mode === "shelter" && r.status === "pending" && (
            <div className="mt-3 flex gap-3">
              <button onClick={() => approve(r)} className="bg-green-600 text-white px-3 py-2 rounded">Approve</button>
              <button onClick={() => reject(r)} className="bg-red-600 text-white px-3 py-2 rounded">Reject</button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
