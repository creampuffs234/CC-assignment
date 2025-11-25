// src/pages/AdminShelterRequests.jsx (Ultra-Clean Redesign)
import React, { useEffect, useState } from "react";
import supabase from "../helper/supabaseClient";

export default function AdminShelterRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [selectedShelter, setSelectedShelter] = useState(null); // State for modal

  // --- Functional Code (Unchanged) ---
  const loadRequests = async () => {
    // ... (Your existing loadRequests logic)
    setLoading(true);
    setErrorMsg("");

    const { data, error } = await supabase
      .from("shelters")
      .select("*")
      .eq("status", "pending")
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      setErrorMsg("Failed to load requests.");
    } else {
      setRequests(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const approveShelter = async (id) => {
    // ... (Your existing approveShelter logic)
    const { error } = await supabase
      .from("shelters")
      .update({ status: "approved" })
      .eq("id", id);

    if (error) {
      alert("Failed to approve shelter.");
      return;
    }
    setSelectedShelter(null); // Close modal
    alert("Shelter approved!");
    loadRequests();
  };

  const rejectShelter = async (id) => {
    // ... (Your existing rejectShelter logic)
    const { error } = await supabase
      .from("shelters")
      .update({ status: "rejected" })
      .eq("id", id);

    if (error) {
      alert("Failed to reject shelter.");
      return;
    }
    setSelectedShelter(null); // Close modal
    alert("Shelter rejected.");
    loadRequests();
  };

  // --- UI Components ---
  
  // Custom Date Formatter
  const formatDateTime = (dateString) => new Date(dateString).toLocaleDateString();

  if (loading) {
    // ... (Your existing loading state)
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="flex flex-col items-center text-indigo-400">
          <svg className="animate-spin h-8 w-8 text-indigo-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="mt-4 text-lg">Loading shelter requests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 p-4 sm:p-8 text-white">
      <div className="max-w-7xl mx-auto">
        
        {/* Header Section */}
        <div className="py-4 mb-8 border-b border-indigo-500/50 sticky top-0 bg-gray-900/90 backdrop-blur-sm z-10">
          <h1 className="text-4xl font-extrabold text-indigo-400">
            Shelter Registration Review 🧑‍💻
          </h1>
          <p className="text-gray-400 mt-1">
            There are **{requests.length}** pending applications requiring your attention.
          </p>
        </div>

        {errorMsg && (
          <div className="bg-red-900/50 p-3 rounded-lg border border-red-700 mb-6">
            <p className="text-red-400 font-medium">Error: {errorMsg}</p>
          </div>
        )}

        {requests.length === 0 ? (
          <div className="text-center py-20 bg-gray-800 rounded-xl border border-gray-700">
            <p className="text-xl text-gray-400 font-light">
              🎉 All clear! No pending shelter applications at this time.
            </p>
          </div>
        ) : (
          /* Table View for Quick Scanning */
          <div className="overflow-x-auto shadow-2xl rounded-xl border border-gray-700">
            <table className="min-w-full divide-y divide-gray-700">
              <thead className="bg-gray-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Shelter Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider hidden sm:table-cell">Email / Phone</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider hidden lg:table-cell">Address</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider hidden sm:table-cell">Requested</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-gray-800 divide-y divide-gray-700">
                {requests.map((shelter) => (
                  <tr key={shelter.id} className="hover:bg-gray-700/50 transition duration-150">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-white">{shelter.name}</div>
                      <div className="text-xs text-gray-500 sm:hidden">ID: {shelter.id}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap hidden sm:table-cell">
                        <div className="text-sm text-gray-300">{shelter.email}</div>
                        <div className="text-xs text-gray-500">{shelter.phone}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400 hidden lg:table-cell">
                        {shelter.address.substring(0, 40)}...
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400 hidden sm:table-cell">
                        {formatDateTime(shelter.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => setSelectedShelter(shelter)}
                          className="text-indigo-400 hover:text-indigo-300 bg-indigo-900/40 px-3 py-1.5 rounded-lg border border-indigo-700/50 transition"
                        >
                            Review & Action
                        </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* --- Action Modal Component --- */}
      {selectedShelter && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-xl p-6 w-full max-w-lg shadow-2xl border border-indigo-600">
            <h3 className="text-2xl font-bold text-indigo-400 mb-4 border-b border-gray-700 pb-3">
              Review: {selectedShelter.name}
            </h3>
            
            {/* Shelter Info */}
            <div className="space-y-3 text-gray-300 mb-6">
                <p><strong className="text-white">Email:</strong> {selectedShelter.email}</p>
                <p><strong className="text-white">Phone:</strong> {selectedShelter.phone}</p>
                <p><strong className="text-white">Address:</strong> {selectedShelter.address}</p>
                <div className="mt-2 p-3 bg-gray-900 rounded-lg">
                    <strong className="text-white block mb-1">Description:</strong> 
                    <p className="text-gray-400 italic text-sm">{selectedShelter.description || "No description provided."}</p>
                </div>
            </div>

            {/* Action Buttons in Modal */}
            <div className="flex gap-4 mt-6 pt-4 border-t border-gray-700">
              <button
                onClick={() => approveShelter(selectedShelter.id)}
                className="flex-1 bg-green-600 hover:bg-green-500 px-5 py-3 rounded-xl font-bold transition shadow-lg shadow-green-900/50"
              >
                ✅ Confirm Approve
              </button>
              <button
                onClick={() => rejectShelter(selectedShelter.id)}
                className="flex-1 bg-red-600 hover:bg-red-500 px-5 py-3 rounded-xl font-bold transition shadow-lg shadow-red-900/50"
              >
                ❌ Confirm Reject
              </button>
            </div>

            <button
              onClick={() => setSelectedShelter(null)}
              className="mt-4 w-full text-sm text-gray-400 hover:text-white transition"
            >
              Cancel / Close Review
            </button>

          </div>
        </div>
      )}
    </div>
  );
}