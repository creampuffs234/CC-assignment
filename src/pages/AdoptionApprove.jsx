// src/pages/AdoptionApprove.jsx
import React, { useEffect, useState } from "react";
import supabase from "../helper/supabaseClient";
import { useParams, Link } from "react-router-dom";

export default function AdoptionApprove() {
  const { id } = useParams();
  const [status, setStatus] = useState(null);

  useEffect(() => {
    approveNow();
  }, []);

  async function approveNow() {
    const { data, error } = await supabase
      .from("adoptions")
      .update({
        status: "approved",
        appointment_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    setStatus(error ? "failed" : "success");
  }

  if (!status) return <p>Approving...</p>;

  return (
    <div className="p-6">
      {status === "success" ? (
        <h1>Adoption Approved!</h1>
      ) : (
        <h1>Failed to Approve</h1>
      )}

      <Link to="/dashboard" className="text-blue-600 underline">
        Back to Dashboard
      </Link>
    </div>
  );
}

