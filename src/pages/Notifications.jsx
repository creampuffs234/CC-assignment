import React, { useEffect, useState } from "react";
import supabase from "../helper/supabaseClient";
import {
  fetchNotificationsForUser,
  fetchNotificationsForShelter,
  markNotificationRead,
} from "../services/notificationService";

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [isShelter, setIsShelter] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);

      const { data: sessionData } = await supabase.auth.getUser();
      const user = sessionData?.user;
      if (!user) return;

      // Check if shelter admin
      const { data: shelterRecord } = await supabase
        .from("shelters")
        .select("id")
        .eq("admin_user_id", user.id)
        .maybeSingle();

      const isShelterUser = !!shelterRecord;
      setIsShelter(isShelterUser);

      // Fetch notifications
      const { data } = isShelterUser
        ? await fetchNotificationsForShelter(shelterRecord.id)
        : await fetchNotificationsForUser(user.id);

      setNotifications(data || []);
      setLoading(false);
    };

    load();

    // Real-time
    const channel = supabase
      .channel("public:notifications")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notifications" },
        (payload) => {
          setNotifications((prev) => [payload.record, ...prev]);
        }
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  const handleMarkRead = async (id) => {
    await markNotificationRead(id);
    setNotifications((list) =>
      list.map((item) =>
        item.id === id ? { ...item, read: true } : item
      )
    );
  };

  // Pretty message formatter
  const formatMeta = (n) => {
    if (!n.meta) return null;

    if (n.meta.adoption_id)
      return "Adoption request received.";

    if (n.meta.report_id)
      return "New lost pet report near your shelter.";

    return null;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center text-white">
        Loading notifications...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black p-6 flex justify-center">
      <div className="w-full max-w-2xl text-white">
        <h2 className="text-3xl font-bold mb-6 border-b border-white/10 pb-2">
          {isShelter ? "Shelter Notifications" : "Notifications"}
        </h2>

        {notifications.length === 0 ? (
          <p className="text-gray-400 text-center mt-10">No notifications yet.</p>
        ) : (
          <div className="space-y-4">
            {notifications.map((n) => (
              <div
                key={n.id}
                className={`p-5 rounded-2xl shadow-lg border backdrop-blur-md transition ${
                  n.read
                    ? "bg-white/5 border-white/10"
                    : "bg-indigo-600/40 border-indigo-500 shadow-indigo-500/30"
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="text-lg font-semibold">{n.message}</p>

                    <p className="text-sm text-blue-300 mt-1">
                      {formatMeta(n)}
                    </p>

                    <p className="text-xs text-gray-300 mt-1">
                      {new Date(n.created_at).toLocaleString()}
                    </p>
                  </div>

                  {!n.read && (
                    <button
                      onClick={() => handleMarkRead(n.id)}
                      className="ml-4 text-sm bg-white/20 hover:bg-white/30 transition px-3 py-1 rounded-lg text-white"
                    >
                      Mark as read
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
