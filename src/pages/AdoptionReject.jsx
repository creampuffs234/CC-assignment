// src/pages/AdoptionReject.jsx
import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import supabase from "../helper/supabaseClient";
import { createNotification } from "../services/notificationService";

export default function AdoptionReject() {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const doReject = async () => {
      setLoading(true);
      setError(null);

      try {
        const { data: existing, error: e1 } = await supabase
          .from("adoptions")
          .select("*")
          .eq("id", id)
          .maybeSingle();

        if (e1 || !existing) {
          setError("Adoption not found.");
          setLoading(false);
          return;
        }

        // update adoption to rejected
        const { data, error } = await supabase
          .from("adoptions")
          .update({ status: "rejected" })
          .eq("id", id)
          .select()
          .single();

        if (error) {
          setError(error.message);
          setLoading(false);
          return;
        }

        // set animal adoption_status back to "open"
        if (data?.animal_id) {
          await supabase.from("animals").update({ adoption_status: "open" }).eq("id", data.animal_id);
        }

        // notify requester
        if (data?.requester_id) {
          await createNotification({
            recipient_id: data.requester_id,
            recipient_type: "user",
            type: "adoption_rejected",
            message: `Your adoption request was rejected. The pet is open for adoption.`,
            meta: { adoption_id: data.id, animal_id: data.animal_id },
          });
        }

        setLoading(false);
      } catch (err) {
        setError(String(err));
        setLoading(false);
      }
    };

    doReject();
  }, [id]);

  if (loading) return <div className="p-6">Processing rejection...</div>;
  if (error)
    return (
      <div className="p-6 max-w-2xl mx-auto">
        <h2 className="text-xl font-bold mb-2">Error</h2>
        <p className="text-red-500">{error}</p>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-100 p-6 flex items-center justify-center">
      <div className="max-w-xl bg-white rounded-xl shadow p-6 text-center">
        <h2 className="text-2xl font-bold mb-2">Adoption Rejected</h2>
        <p className="text-gray-700 mb-4">You have rejected this adoption request. The requester was notified.</p>
        <img
          src="/mnt/data/b7fa9fa7-971f-42f3-91df-1a7d53e00f5a.png"
          alt="pet"
          className="mx-auto rounded-lg mb-4 max-h-40"
        />
        <div className="mt-4">
          <Link to="/marketplace" className="inline-block bg-indigo-600 text-white px-4 py-2 rounded">
            Back to Marketplace
          </Link>
        </div>
      </div>
    </div>
  );
}
