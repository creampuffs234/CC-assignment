// src/pages/Dashboard.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import supabase from "../helper/supabaseClient";
import { getShelterByUser } from "../services/shelterService";

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [profileType, setProfileType] = useState("user"); // user | shelter
  const [shelterRow, setShelterRow] = useState(null); // shelter DB row if exists

  useEffect(() => {
    const loadUser = async () => {
      const { data: auth } = await supabase.auth.getUser();
      const authUser = auth?.user;
      setUser(authUser);
      setProfileType("user");

      if (!authUser) return;

      // find shelter row for this user
      const { data: shelterData, error } = await getShelterByUser(authUser.id);
      if (error) console.error("shelter lookup:", error);

      if (shelterData) {
        setShelterRow(shelterData);
        if (shelterData.status === "approved") setProfileType("shelter");
        else setProfileType("pending");
      } else {
        setShelterRow(null);
      }
    };

    loadUser();
  }, []);

  const Signout = async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) navigate("/login");
  };

  const portals = [
    {
      title: "Marketplace",
      desc: "Browse animals available for adoption",
      route: "/marketplace",
      visible: true,
    },
    {
      title: "Add a Pet",
      desc: "Post a new pet for adoption",
      route: "/add-pet",
      visible: true,
    },
    {
      title: "Adoption Requests",
      desc:
        profileType === "shelter"
          ? "View requests submitted to your shelter"
          : "View your submitted adoption applications",
      route: "/adoption-list",
      visible: true,
    },
    {
      title: "Notifications",
      desc: "See alerts & adoption updates",
      route: "/notifications",
      visible: true,
    },
    // Register Shelter button shows only if NOT approved AND no pending
    {
      title: "Register Shelter",
      desc: "Apply to register your shelter (approval required)",
      route: "/create-shelter",
      visible: profileType === "user" && !shelterRow,
    },
    // My Shelter shown only when approved
    {
      title: "My Shelter",
      desc: "Manage your shelter & listed animals",
      route: `/shelter/${shelterRow?.id || user?.id}`,
      visible: profileType === "shelter",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-400 to-green-700 text-white p-8">
      <div className="max-w-4xl mx-auto mb-6 justify-center text-center">
        <h1 className="text-4xl font-bold">Dashboard</h1>
        <p className="text-gray-300 mt-2">Welcome {user?.email || "User"}</p>
        <p className="text-gray-400 text-sm mt-1 capitalize">
          Account Type: {profileType}
        </p>
        {shelterRow && shelterRow.status === "pending" && (
          <p className="mt-2 text-yellow-300">
            Shelter registration pending approval.
          </p>
        )}
        {shelterRow && shelterRow.status === "rejected" && (
          <p className="mt-2 text-red-300">Shelter registration was rejected.</p>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-4xl mx-auto">
        {portals.filter((p) => p.visible).map((portal, idx) => (
          <div
            key={idx}
            onClick={() => navigate(portal.route)}
            className="cursor-pointer bg-black/30 backdrop-blur-md border border-white/10 p-6 rounded-2xl hover:bg-white/20 transition shadow-lg hover:shadow-xl transform hover:-translate-y-1"
          >
            <h3 className="text-2xl font-semibold mb-1">{portal.title}</h3>
            <p className="text-blue-300">{portal.desc}</p>
          </div>
        ))}
      </div>

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
