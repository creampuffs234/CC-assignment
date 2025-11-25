// src/pages/AdoptionList.jsx (Updated Styling)
import React, { useEffect, useState } from "react";
import {
  fetchAdoptionsForShelter, // Currently unused but kept for future logic
  fetchAdoptionsForUser,
  updateAdoptionStatus,
} from "../services/adoptionService";
import { createNotification } from "../services/notificationService";
import supabase from "../helper/supabaseClient";

// Helper component for status badge
const StatusBadge = ({ status }) => {
  let colorClass = "bg-gray-200 text-gray-800";
  
  if (status === "pending") {
    colorClass = "bg-yellow-100 text-yellow-700 font-semibold";
  } else if (status === "approved") {
    colorClass = "bg-green-100 text-green-700 font-semibold";
  } else if (status === "rejected") {
    colorClass = "bg-red-100 text-red-700 font-semibold";
  }
  
  return (
    <span className={`inline-flex items-center px-3 py-1 text-xs leading-4 rounded-full capitalize ${colorClass}`}>
      {status}
    </span>
  );
};


export default function AdoptionList() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  // NOTE: Assuming this will be determined by user role in future
  const [isShelter, setIsShelter] = useState(false); 
  const [userId, setUserId] = useState(null);

  // -----------------------------
  // Load User + Requests (Functional Code Unchanged)
  // -----------------------------
  useEffect(() => {
    const load = async () => {
      setLoading(true);

      const { data: authData } = await supabase.auth.getUser();
      const user = authData?.user;

      if (!user) {
        setRequests([]);
        setLoading(false);
        return;
      }

      setUserId(user.id);

      // --- TEMP LOGIC ---
      // TODO: Actual shelter detection logic here.
      // For now we assume normal user
      setIsShelter(false);

      const { data: userRequests } = await fetchAdoptionsForUser(user.id);
      setRequests(userRequests || []);

      setLoading(false);
    };

    load();
  }, []);

  // -----------------------------
  // Action Handlers (Functional Code Unchanged)
  // -----------------------------
  const refreshRequests = async () => {
    if (!userId) return;
    const { data } = await fetchAdoptionsForUser(userId);
    setRequests(data || []);
  };
  
  const handleApprove = async (adoptionId, requesterId, animalTitle) => {
    // ... (Your existing handleApprove logic)
    const appointmentTime = new Date().toISOString();

    await updateAdoptionStatus(adoptionId, {
      status: "approved",
      appointment_at: appointmentTime,
    });

    await createNotification({
      recipient_id: requesterId,
      recipient_type: "user",
      type: "adoption_approved",
      message: `Your adoption request for ${animalTitle} has been approved.`,
      meta: { adoption_id: adoptionId },
    });

    refreshRequests();
  };

  const handleReject = async (adoptionId, requesterId, animalTitle) => {
    // ... (Your existing handleReject logic)
    await updateAdoptionStatus(adoptionId, { status: "rejected" });

    await createNotification({
      recipient_id: requesterId,
      recipient_type: "user",
      type: "adoption_rejected",
      message: `Your adoption request for ${animalTitle} was rejected.`,
      meta: { adoption_id: adoptionId },
    });

    refreshRequests();
  };

  // -----------------------------
  // UI
  // -----------------------------
  
  // Custom Loading State
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <p className="text-lg text-gray-600">Loading adoption requests...</p>
      </div>
    );
  }

  const listTitle = isShelter ? "Pending Adoption Requests for Your Animals 🐾" : "Your Adoption Applications 📝";

  return (
    <div className="min-h-screen bg-gray-50 p-6 sm:p-10">
      <div className="max-w-4xl mx-auto">
        
        {/* Dynamic Header */}
        <h2 className="text-3xl font-extrabold text-gray-900 mb-6 border-b pb-2">
          {listTitle}
        </h2>

        {requests.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl shadow border border-gray-200">
            <p className="text-xl text-gray-500 font-light">
              {isShelter ? "No new requests to review!" : "You haven't submitted any adoption applications yet."}
            </p>
          </div>
        )}

        <div className="space-y-4">
          {requests.map((req) => (
            <div
              key={req.id}
              className="bg-white border border-gray-200 p-5 rounded-xl shadow-lg hover:shadow-xl transition duration-300 flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
            >
              
              {/* Left: Info Section */}
              <div className="flex-1 w-full">
                <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-indigo-600">
                      {req.animals?.title || "Unknown Animal"}
                    </h3>
                    <StatusBadge status={req.status} />
                </div>
                
                <p className="text-sm text-gray-500 mt-1">
                  Requested on: {new Date(req.created_at).toLocaleDateString()}
                </p>

                {/* Shelter/Admin View: Show requester contact details */}
                {isShelter && (
                    <div className="mt-2 p-3 bg-gray-100 rounded-lg">
                        <p className="text-sm text-gray-700">
                            <strong className="font-semibold">Requester:</strong> {req.requester_name}
                        </p>
                        <p className="text-sm text-gray-700">
                            <strong className="font-semibold">Contact:</strong> {req.contact}
                        </p>
                    </div>
                )}
                
                {/* User View: Show appointment time if approved */}
                {!isShelter && req.status === "approved" && req.appointment_at && (
                    <p className="text-sm text-green-600 font-medium mt-2">
                        Appointment Scheduled: {new Date(req.appointment_at).toLocaleString()}
                    </p>
                )}
                
                {/* User View: Show pending info */}
                {!isShelter && req.status === "pending" && (
                    <p className="text-sm text-yellow-600 font-medium mt-2">
                        Awaiting Review by the Shelter.
                    </p>
                )}
                
              </div>

              {/* Right: Action Buttons (Only for Shelter/Admin, and only if pending) */}
              {isShelter && req.status === "pending" && (
                <div className="flex gap-3 mt-3 md:mt-0">
                  <button
                    onClick={() =>
                      handleApprove(req.id, req.requester_id, req.animals?.title)
                    }
                    className="bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded-lg transition text-sm shadow-md"
                  >
                    Approve
                  </button>

                  <button
                    onClick={() =>
                      handleReject(req.id, req.requester_id, req.animals?.title)
                    }
                    className="bg-red-600 hover:bg-red-700 text-white font-semibold px-4 py-2 rounded-lg transition text-sm shadow-md"
                  >
                    Reject
                  </button>
                </div>
              )}
              
              {/* Shelter/Admin View: Show status if action is done */}
              {isShelter && req.status !== "pending" && (
                  <p className={`font-bold text-sm px-4 py-2 rounded-lg ${req.status === 'approved' ? 'text-green-600' : 'text-red-600'}`}>
                      {req.status.toUpperCase()}
                  </p>
              )}
              
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}