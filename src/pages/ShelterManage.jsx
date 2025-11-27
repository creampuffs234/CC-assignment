// src/pages/ShelterManage.jsx
import React, { useEffect, useState } from "react";
import supabase from "../helper/supabaseClient";
import { updateAdoptionStatus } from "../services/adoptionService";
import { createNotification } from "../services/notificationService";

export default function ShelterManage() {
  const [shelter, setShelter] = useState(null);
  const [animals, setAnimals] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ MOVE FUNCTION UP BEFORE useEffect
  async function loadShelter() {
    setLoading(true);

    // 1. Logged-in user
    const { data: auth } = await supabase.auth.getUser();
    const user = auth?.user;
    if (!user) return;

    // 2. Fetch shelter where admin_user_id = current user
    const { data: s } = await supabase
      .from("shelters")
      .select("*")
      .eq("admin_user_id", user.id)
      .maybeSingle();

    setShelter(s);

    if (s) {
      // 3. Fetch animals for this shelter
      const { data: a } = await supabase
        .from("animals")
        .select("*")
        .eq("shelter_id", s.id)
        .order("created_at", { ascending: false });

      setAnimals(a || []);

      // 4. Fetch adoption requests for this shelter
      const { data: r } = await supabase
        .from("adoptions")
        .select("*, animals(title, image_url)")
        .eq("shelter_id", s.id)
        .order("created_at", { ascending: false });

      setRequests(r || []);
    }

    setLoading(false);
  }

  // ✅ useEffect NOW works because loadShelter exists above it
  useEffect(() => {
    loadShelter();
  }, []);
   
  /* APPROVE ADOPTION */
  async function approve(req) {
    await updateAdoptionStatus(req.id, {
      status: "approved",
      appointment_at: new Date().toISOString(),
    });

    await createNotification({
      recipient_id: req.requester_id,
      recipient_type: "user",
      message: `Your adoption request for ${req.animals.title} has been APPROVED.`,
      meta: { adoption_id: req.id },
    });

    loadShelter();
  }

  /* REJECT ADOPTION */
  async function reject(req) {
    await updateAdoptionStatus(req.id, { status: "rejected" });

    await createNotification({
      recipient_id: req.requester_id,
      recipient_type: "user",
      message: `Your adoption request for ${req.animals.title} has been REJECTED.`,
      meta: { adoption_id: req.id },
    });

    loadShelter();
  }

  if (loading) return <p className="p-6">Loading...</p>;
  if (!shelter) return <p className="p-6">You do not manage a shelter.</p>;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">{shelter.name} — Management</h1>

      {/* ANIMALS */}
      <h2 className="text-2xl mt-8 font-semibold mb-3">Animals You Posted</h2>
      {animals.length === 0 ? (
        <p>No animals posted yet.</p>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {animals.map((a) => (
            <div key={a.id} className="border p-4 rounded shadow">
              <img
                src={a.image_url || "/placeholder.jpg"}
                className="w-full h-40 object-cover rounded"
              />
              <h3 className="font-bold mt-2">{a.title}</h3>
              <p className="text-sm text-gray-600">
                {a.species} • {a.breed}
              </p>
              <p className="text-xs mt-1">{a.adoption_status}</p>
            </div>
          ))}
        </div>
      )}

      {/* REQUESTS */}
      <h2 className="text-2xl mt-10 font-semibold mb-3">
        Incoming Adoption Requests
      </h2>

      {requests.length === 0 ? (
        <p>No adoption requests yet.</p>
      ) : (
        <div className="space-y-4">
          {requests.map((req) => (
            <div key={req.id} className="border p-4 rounded shadow bg-white">
              <h3 className="text-xl font-semibold">{req.animals.title}</h3>
              <p className="text-gray-600 text-sm">
                From: {req.requester_name} • {req.contact}
              </p>
              <p className="mt-2">Message: {req.message}</p>
              <p className="mt-2 text-sm">
                Status:{" "}
                <strong className="capitalize">{req.status}</strong>
              </p>

              {req.status === "pending" ? (
                <div className="flex gap-3 mt-3">
                  <button
                    onClick={() => approve(req)}
                    className="bg-green-600 text-white px-3 py-2 rounded"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => reject(req)}
                    className="bg-red-600 text-white px-3 py-2 rounded"
                  >
                    Reject
                  </button>
                </div>
              ) : (
                <p className="mt-3 font-bold">
                  Decision:{" "}
                  <span
                    className={
                      req.status === "approved"
                        ? "text-green-600"
                        : "text-red-600"
                    }
                  >
                    {req.status.toUpperCase()}
                  </span>
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
