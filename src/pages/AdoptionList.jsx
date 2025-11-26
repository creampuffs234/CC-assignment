// src/pages/AdoptionList.jsx
import React, { useEffect, useState } from "react";
import supabase from "../helper/supabaseClient";
import {
  fetchAdoptionsForUser,
  updateAdoptionStatus,
} from "../services/adoptionService";
import { createNotification } from "../services/notificationService";

export default function AdoptionList() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isOwner, setIsOwner] = useState(false);
  const [isShelter, setIsShelter] = useState(false);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);

    const { data: session } = await supabase.auth.getUser();
    const user = session?.user;
    if (!user) return;
    setUserId(user.id);

    // Check if shelter admin
    const { data: shelter } = await supabase
      .from("shelters")
      .select("id")
      .eq("admin_user_id", user.id)
      .maybeSingle();

    if (shelter) setIsShelter(true);

    // Fetch user's adoptions (requester)
    const { data } = await fetchAdoptionsForUser(user.id);
    setList(data || []);
    setLoading(false);
  }

  async function approve(req) {
    const { data, error } = await updateAdoptionStatus(req.id, {
      status: "approved",
      appointment_at: new Date().toISOString(),
    });

    await createNotification({
      recipient_id: req.requester_id,
      recipient_type: "user",
      message: `Your adoption request for ${req.animals.title} has been APPROVED.`,
      meta: { adoption_id: req.id },
    });

    load();
  }

  async function reject(req) {
    await updateAdoptionStatus(req.id, { status: "rejected" });

    await createNotification({
      recipient_id: req.requester_id,
      recipient_type: "user",
      message: `Your adoption request for ${req.animals.title} was REJECTED.`,
      meta: { adoption_id: req.id },
    });

    load();
  }

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">
        {isShelter ? "Adoption Requests for Your Shelter" : "Your Adoption Requests"}
      </h1>

      {list.length === 0 && <p>No adoption requests found.</p>}

      <div className="space-y-4">
        {list.map((req) => (
          <div key={req.id} className="border p-4 rounded-lg shadow bg-white">
            <h2 className="text-xl font-semibold">{req.animals.title}</h2>

            <p className="text-sm text-gray-500">
              Status: <strong className="capitalize">{req.status}</strong>
            </p>

            <p className="text-sm">Message: {req.message}</p>

            {isShelter || isOwner ? (
              req.status === "pending" ? (
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
                <p className="mt-2 font-bold">
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
              )
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}
