// src/pages/AdoptionApprove.jsx (Updated Styling)
import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import supabase from "../helper/supabaseClient";
import { createNotification } from "../services/notificationService";

export default function AdoptionApprove() {
  const { id } = useParams(); // adoption id
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [adoption, setAdoption] = useState(null);

  // --- Functional Code (Unchanged) ---
  useEffect(() => {
    const doApprove = async () => {
      setLoading(true);
      setError(null);

      try {
        // fetch adoption to get animal_id, requester_id
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

        // update adoption status to approved and set an appointment timestamp (now)
        const { data, error } = await supabase
          .from("adoptions")
          .update({ status: "approved", appointment_at: new Date().toISOString() })
          .eq("id", id)
          .select()
          .single();

        if (error) {
          setError(error.message);
          setLoading(false);
          return;
        }

        // set animal adoption_status to "pending"
        if (data?.animal_id) {
          await supabase
            .from("animals")
            .update({ adoption_status: "pending" })
            .eq("id", data.animal_id);
        }

        // create notification for requester (user)
        if (data?.requester_id) {
          await createNotification({
            recipient_id: data.requester_id,
            recipient_type: "user",
            type: "adoption_approved",
            message: `Your adoption request for the pet was approved.`,
            meta: { adoption_id: data.id, animal_id: data.animal_id },
          });
        }

        setAdoption(data);
        setLoading(false);
      } catch (err) {
        setError(String(err));
        setLoading(false);
      }
    };

    doApprove();
  }, [id]);

  // --- UI Loading State ---
  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="flex flex-col items-center text-indigo-600 p-8 rounded-xl shadow-lg bg-white">
          <svg className="animate-spin h-8 w-8 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="mt-4 text-lg font-medium text-gray-700">Approving adoption request...</p>
        </div>
      </div>
    );

  // --- UI Error State ---
  if (error)
    return (
      <div className="flex items-center justify-center min-h-screen bg-red-50 p-6">
        <div className="max-w-xl bg-white rounded-xl shadow-2xl p-8 text-center border-t-4 border-red-500">
          <svg className="mx-auto h-12 w-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          <h2 className="text-3xl font-extrabold text-red-700 mt-4 mb-2">Approval Failed</h2>
          <p className="text-gray-600 mb-6">
            There was an issue processing the approval. Please check the logs or try again.
          </p>
          <p className="p-3 bg-red-100 text-sm text-red-600 rounded-lg break-words">{error}</p>
          <div className="mt-6">
            <Link to="/dashboard" className="inline-block text-red-600 hover:text-red-800 font-medium underline transition">
              Return to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );

  // --- UI Success State ---
  return (
    <div className="min-h-screen bg-green-50 p-6 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center border-t-8 border-green-500 transform transition duration-500 hover:scale-[1.02]">
        
        {/* Success Icon */}
        <svg className="mx-auto h-16 w-16 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>

        <h2 className="text-4xl font-extrabold text-green-700 mt-4 mb-2">Success!</h2>
        
        <p className="text-lg text-gray-700 mb-6">
          The **adoption request (ID: {adoption?.id || 'N/A'})** has been **officially approved**.
        </p>
        
        <p className="text-gray-500 mb-8 italic">
          The requester has been notified and the pet's status updated.
        </p>

        {/* Action Buttons */}
        <div className="mt-4 flex flex-col space-y-3">
          <Link 
            to="/dashboard" 
            className="w-full inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-3 rounded-xl transition shadow-md shadow-indigo-500/50"
          >
            Go to Admin Dashboard
          </Link>
          <Link 
            to="/marketplace" 
            className="w-full inline-block text-indigo-600 hover:text-indigo-800 font-medium py-2 rounded-xl transition border border-indigo-200 hover:border-indigo-400"
          >
            View Marketplace
          </Link>
        </div>
      </div>
    </div>
  );
}