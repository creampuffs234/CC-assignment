// src/pages/ProfileEdit.jsx
import React, { useEffect, useState } from "react";
import supabase from "../helper/supabaseClient";

export default function ProfileEdit() {
  const [profile, setProfile] = useState(null);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [bio, setBio] = useState("");
  const [avatarFile, setAvatarFile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    const { data: sessionData } = await supabase.auth.getUser();
    const user = sessionData?.user;

    const { data, error } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (!error && data) {
      setProfile(data);
      setFullName(data.full_name || "");
      setPhone(data.phone || "");
      setLocation(data.location || "");
      setBio(data.bio || "");
    }

    setLoading(false);
  };

  const handleSave = async () => {
    setLoading(true);

    let avatar_url = profile.avatar_url;

    // Upload new avatar if selected
    if (avatarFile) {
      const fileExt = avatarFile.name.split(".").pop();
      const filePath = `avatars/${profile.id}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, avatarFile, { upsert: true });

      if (uploadError) {
        alert("Failed to upload image.");
        setLoading(false);
        return;
      }

      const { data: urlData } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);

      avatar_url = urlData.publicUrl;
    }

    const { error } = await supabase
      .from("user_profiles")
      .update({
        full_name: fullName,
        phone,
        location,
        bio,
        avatar_url,
      })
      .eq("id", profile.id);

    if (error) {
      alert("Failed to save profile");
    } else {
      alert("Profile updated!");
    }

    setLoading(false);
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6 max-w-xl mx-auto bg-white rounded-xl shadow">
      <h2 className="text-xl font-bold mb-4">Edit Profile</h2>

      {/* Avatar input */}
      <div className="mb-4">
        <img
          src={profile.avatar_url || "https://via.placeholder.com/80"}
          alt=""
          className="w-20 h-20 rounded-full object-cover border mb-2"
        />
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setAvatarFile(e.target.files?.[0])}
        />
      </div>

      {/* Full name */}
      <input
        value={fullName}
        onChange={(e) => setFullName(e.target.value)}
        placeholder="Full name"
        className="w-full p-2 border rounded mb-3"
      />

      {/* Phone */}
      <input
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        placeholder="Phone number"
        className="w-full p-2 border rounded mb-3"
      />

      {/* Location */}
      <input
        value={location}
        onChange={(e) => setLocation(e.target.value)}
        placeholder="Location"
        className="w-full p-2 border rounded mb-3"
      />

      {/* Bio */}
      <textarea
        value={bio}
        onChange={(e) => setBio(e.target.value)}
        placeholder="Bio"
        className="w-full p-2 border rounded mb-4"
      />

      <button
        onClick={handleSave}
        className="bg-indigo-600 text-white px-4 py-2 rounded"
      >
        Save Changes
      </button>
    </div>
  );
}
