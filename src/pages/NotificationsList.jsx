// src/pages/NotificationsList.jsx
import React, { useEffect, useState } from "react";
import supabase from "../helper/supabaseClient";
import { fetchNotificationsForRecipient, markNotificationRead } from "../services/notificationService";

export default function NotificationsList() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [recipientType, setRecipientType] = useState("user");

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    const { data: session } = await supabase.auth.getUser();
    const user = session?.user;
    if (!user) return;

    // decide whether this user is a shelter admin
    const { data: shelter } = await supabase
      .from("shelters")
      .select("id")
      .eq("admin_user_id", user.id)
      .maybeSingle();

    const rType = shelter ? "shelter" : "user";
    setRecipientType(rType);

    const res = await fetchNotificationsForRecipient(shelter ? shelter.id : user.id, { recipientType: rType });
    setNotifications(res.data || []);
    setLoading(false);
  }

  async function markRead(id) {
    await markNotificationRead(id);
    load();
  }

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Notifications</h1>
      {notifications.length === 0 && <p>No notifications</p>}
      <div className="space-y-4">
        {notifications.map((n) => (
          <div key={n.id} className={`p-4 rounded shadow ${n.read ? "bg-white" : "bg-indigo-800 text-white"}`}>
            <div className="flex justify-between items-start">
              <div>
                <div className="font-semibold">{n.message}</div>
                <div className="text-xs text-gray-300">{new Date(n.created_at).toLocaleString()}</div>
              </div>
              {!n.read && <button onClick={() => markRead(n.id)} className="bg-white text-indigo-800 px-3 py-1 rounded">Mark as read</button>}
            </div>
            {n.meta && <pre className="text-xs mt-2 bg-black/10 p-2 rounded">{JSON.stringify(n.meta)}</pre>}
          </div>
        ))}
      </div>
    </div>
  );
}
