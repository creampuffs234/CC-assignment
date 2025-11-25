// src/services/notificationService.js
import supabase from "../helper/supabaseClient";

/**
 * Create a notification
 */
export async function createNotification(payload) {
  try {
    const { data, error } = await supabase
      .from("notifications")
      .insert([payload])
      .select()
      .single();

    return { data, error };
  } catch (err) {
    console.error("createNotification error:", err);
    return { data: null, error: err };
  }
}

/**
 * Fetch ALL notifications for ANY recipient (user or shelter)
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
    console.error("fetchNotificationsForRecipient error:", err);
    return { data: null, error: err };
  }
}

/**
 * Fetch USER notifications only
 */
export async function fetchNotificationsForUser(userId) {
  try {
    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("recipient_id", userId)
      .eq("recipient_type", "user")
      .order("created_at", { ascending: false });

    return { data, error };
  } catch (err) {
    console.error("fetchNotificationsForUser error:", err);
    return { data: null, error: err };
  }
}

/**
 * Fetch SHELTER notifications only
 */
export async function fetchNotificationsForShelter(shelterId) {
  try {
    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("recipient_id", shelterId)
      .eq("recipient_type", "shelter")
      .order("created_at", { ascending: false });

    return { data, error };
  } catch (err) {
    console.error("fetchNotificationsForShelter error:", err);
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
    console.error("markNotificationRead error:", err);
    return { data: null, error: err };
  }
}
