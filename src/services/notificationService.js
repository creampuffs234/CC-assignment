// src/services/notificationService.js
import supabase from "../helper/supabaseClient";

/**
 * Create a notification — works for BOTH:
 *  - user notifications
 *  - shelter notifications
 *
 * RLS rules are satisfied because:
 *  - user → user notifications allowed
 *  - shelter admin can read notifications for their shelter
 *  - insert is allowed WITHOUT service role (we set that in RLS)
 */
export async function createNotification(payload) {
  try {
    const { data, error } = await supabase
      .from("notifications")
      .insert([payload])
      .select()
      .single();

    if (error) {
      console.error("❌ createNotification ERROR:", error);
    }

    return { data, error };
  } catch (err) {
    console.error("❌ createNotification EXCEPTION:", err);
    return { data: null, error: err };
  }
}

/**
 * Fetch ALL notifications for a specific recipient
 */
export async function fetchNotificationsForRecipient(recipientId) {
  try {
    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("recipient_id", recipientId)
      .order("created_at", { ascending: false });

    return { data, error };
  } catch (err) {
    console.error("❌ fetchNotificationsForRecipient:", err);
    return { data: null, error: err };
  }
}

/**
 * Fetch notifications for USER
 */
export async function fetchNotificationsForUser(userId) {
  try {
    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("recipient_type", "user")
      .eq("recipient_id", userId)
      .order("created_at", { ascending: false });

    return { data, error };
  } catch (err) {
    console.error("❌ fetchNotificationsForUser:", err);
    return { data: null, error: err };
  }
}

/**
 * Fetch notifications for SHELTER
 */
export async function fetchNotificationsForShelter(shelterId) {
  try {
    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("recipient_type", "shelter")
      .eq("recipient_id", shelterId)
      .order("created_at", { ascending: false });

    return { data, error };
  } catch (err) {
    console.error("❌ fetchNotificationsForShelter:", err);
    return { data: null, error: err };
  }
}

/**
 * Mark notification as read
 */
export async function markNotificationRead(notificationId) {
  try {
    const { data, error } = await supabase
      .from("notifications")
      .update({ read: true })
      .eq("id", notificationId)
      .select()
      .single();

    return { data, error };
  } catch (err) {
    console.error("❌ markNotificationRead:", err);
    return { data: null, error: err };
  }
}
