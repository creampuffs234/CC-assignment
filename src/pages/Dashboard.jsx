// src/pages/Dashboard.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import supabase from "../helper/supabaseClient";
import { getShelterByUser } from "../services/shelterService";

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [profileType, setProfileType] = useState("user"); // user | shelter | pending
  const [shelterRow, setShelterRow] = useState(null);
  const [isRescue, setIsRescue] = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      const { data: auth } = await supabase.auth.getUser();
      const authUser = auth?.user;
      setUser(authUser);
      if (!authUser) return;

      // RESCUE TEAM CHECK
      const { data: rescueCheck } = await supabase
        .from("rescue_team")
        .select("*")
        .eq("user_email", authUser.email)
        .maybeSingle();
      if (rescueCheck) setIsRescue(true);

      // SHELTER CHECK
      const { data: shelterData } = await getShelterByUser(authUser.id);
      if (shelterData) {
        setShelterRow(shelterData);
        if (shelterData.status === "approved") setProfileType("shelter");
        else setProfileType("pending");
      }
    };

    loadUser();
  }, []);

  const Signout = async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-700 to-purple-700 text-white p-8">
      {/* HEADER */}
      <div className="max-w-4xl mx-auto text-center mb-10">
        <h1 className="text-4xl font-bold">Dashboard</h1>
        <p className="text-gray-200 mt-2">Welcome {user?.email}</p>
        <p className="text-gray-300 text-sm capitalize">
          Account Type: {profileType}
        </p>

        {shelterRow?.status === "pending" && (
          <p className="text-yellow-300 mt-2">Shelter registration pending...</p>
        )}
        {shelterRow?.status === "rejected" && (
          <p className="text-red-300 mt-2">Shelter registration was rejected.</p>
        )}
        {isRescue && (
          <p className="text-blue-300 mt-2">Rescue Team Member</p>
        )}
      </div>

      {/* GRID */}
      <div className="max-w-4xl mx-auto space-y-10">

        {/* GENERAL FEATURES */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">General</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <DashboardCard
              title="Marketplace"
              desc="Browse animals for adoption"
              route="/marketplace"
              navigate={navigate}
            />

            <DashboardCard
              title="Add a Pet"
              desc="Post a new pet for adoption"
              route="/add-pet"
              navigate={navigate}
            />

            <DashboardCard
              title="Adoption Requests"
              desc={
                profileType === "shelter"
                  ? "Requests submitted to your shelter"
                  : "Your adoption requests"
              }
              route="/adoption-list"
              navigate={navigate}
            />
          </div>
        </section>

        {/* LOST & FOUND SECTION */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Lost & Found</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

            <DashboardCard
              title="Report Lost Pet"
              desc="Submit a lost pet report"
              route="/report"
              navigate={navigate}
            />

            <DashboardCard
              title="Lost Reports"
              desc="View all lost pet reports"
              route="/lost-reports"
              navigate={navigate}
            />

            <DashboardCard
              title="My Lost Reports"
              desc="View reports you submitted"
              route="/user/reports"
              navigate={navigate}
            />
          </div>
        </section>

        {/* SHELTER FEATURES */}
        {profileType === "user" && !shelterRow && (
          <section>
            <h2 className="text-2xl font-semibold mb-4">Shelter Registration</h2>
            <DashboardCard
              title="Register Shelter"
              desc="Apply to register your animal shelter"
              route="/create-shelter"
              navigate={navigate}
            />
          </section>
        )}

        {profileType === "shelter" && (
          <section>
            <h2 className="text-2xl font-semibold mb-4">Shelter Management</h2>
            <DashboardCard
              title="My Shelter"
              desc="Manage shelter animals and lost reports"
              route={`/shelter/${shelterRow?.id}`}
              navigate={navigate}
            />
          </section>
        )}

        {/* RESCUE TEAM */}
        {isRescue && (
          <section>
            <h2 className="text-2xl font-semibold mb-4">Rescue Team</h2>
            <DashboardCard
              title="Rescue Dashboard"
              desc="Handle incoming lost pet alerts"
              route="/rescue"
              navigate={navigate}
            />
          </section>
        )}
      </div>

      {/* SIGN OUT */}
      <div className="mt-12 flex justify-center">
        <button
          onClick={Signout}
          className="bg-red-600 hover:bg-red-700 text-white shadow-lg font-semibold py-2 px-6 rounded-lg transition"
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}

/* Reusable Card Component */
function DashboardCard({ title, desc, route, navigate }) {
  return (
    <div
      onClick={() => navigate(route)}
      className="cursor-pointer bg-black/30 backdrop-blur-md border border-white/10 
                 p-6 rounded-2xl hover:bg-white/20 transition shadow-lg hover:shadow-xl 
                 transform hover:-translate-y-1"
    >
      <h3 className="text-xl font-semibold mb-1">{title}</h3>
      <p className="text-blue-300 text-sm">{desc}</p>
    </div>
  );
}
