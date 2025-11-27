import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import supabase from "../helper/supabaseClient";

export default function UserPage() {
  const { id } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);

  const [fullName, setFullName] = useState("");
  const [bio, setBio] = useState("");
  const [phone, setPhone] = useState("");
  const [avatarFile, setAvatarFile] = useState(null);

  useEffect(() => {
    loadProfile();
  }, [id]);

  async function loadProfile() {
    setLoading(true);

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error || !data) {
      setProfile(null);
      setLoading(false);
      return;
    }

    setProfile(data);
    setFullName(data.full_name || "");
    setBio(data.bio || "");
    setPhone(data.phone || "");
    setLoading(false);
  }

  async function uploadAvatar() {
    if (!avatarFile) return profile.avatar_url;

    const fileName = `${id}-${Date.now()}`;
    const { data, error } = await supabase.storage
      .from("avatars")
      .upload(fileName, avatarFile);

    if (error) return profile.avatar_url;

    const { data: urlData } = supabase.storage
      .from("avatars")
      .getPublicUrl(data.path);

    return urlData.publicUrl;
  }

  async function saveChanges() {
    const avatarUrl = await uploadAvatar();

    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: fullName,
        bio,
        phone,
        avatar_url: avatarUrl
      })
      .eq("id", id);

    if (error) {
      alert("Failed to save");
      return;
    }

    setEditing(false);
    loadProfile();
  }

  if (loading) return <div className="p-6">Loading…</div>;
  if (!profile) return <div className="p-6">User not found</div>;

  return (
    <div className="max-w-3xl mx-auto p-6">

      <h1 className="text-3xl font-bold mb-6">My Profile</h1>

      {!editing ? (
        <div className="space-y-6 bg-white p-6 rounded-xl shadow">

          <img
            src={profile.avatar_url || "https://placekitten.com/200/200"}
            className="w-32 h-32 rounded-full object-cover"
          />

          <p><strong>Name:</strong> {profile.full_name || "Not set"}</p>
          <p><strong>Bio:</strong> {profile.bio || "Not set"}</p>
          <p><strong>Phone:</strong> {profile.phone || "Not set"}</p>

          <button
            className="bg-indigo-600 text-white px-4 py-2 rounded"
            onClick={() => setEditing(true)}
          >
            Edit Profile
          </button>
        </div>
      ) : (
        <div className="space-y-4 bg-white p-6 rounded-xl shadow">

          <label className="block">
            <span className="font-medium">Profile Image</span>
            <input
              type="file"
              className="mt-2"
              onChange={(e) => setAvatarFile(e.target.files[0])}
            />
          </label>

          <label className="block">
            <span className="font-medium">Full Name</span>
            <input
              className="border p-2 w-full rounded"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </label>

          <label className="block">
            <span className="font-medium">Bio</span>
            <textarea
              className="border p-2 w-full rounded"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
            />
          </label>

          <label className="block">
            <span className="font-medium">Phone</span>
            <input
              className="border p-2 w-full rounded"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </label>

          <button
            className="bg-green-600 text-white px-4 py-2 rounded"
            onClick={saveChanges}
          >
            Save Changes
          </button>

          <button
            className="bg-gray-400 text-white px-4 py-2 rounded ml-3"
            onClick={() => setEditing(false)}
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}
