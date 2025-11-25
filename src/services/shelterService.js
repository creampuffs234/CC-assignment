// src/services/shelterService.js
import supabase from "../helper/supabaseClient";
import { createNotification } from "./notificationService";

/**
 * Create a shelter request (status = 'pending') and notify admins
 * payload: { admin_user_id, name, email, phone, address, description }
 */
export async function createShelterRequest(payload) {
  try {
    const { data, error } = await supabase
      .from("shelters")
      .insert([{ ...payload, status: "pending" }])
      .select()
      .single();

    if (error) return { data: null, error };

    // Notify admins (recipient_type: 'admin') — admin system can listen to this
    await createNotification({
      recipient_id: null,
      recipient_type: "admin",
      type: "shelter_request",
      message: `New shelter registration request: ${data.name}`,
      meta: { shelter_id: data.id, user_id: payload.admin_user_id },
    });

    return { data, error: null };
  } catch (err) {
    console.error("createShelterRequest error:", err);
    return { data: null, error: err };
  }
}

/** Return shelter row where admin_user_id = userId (may be pending/approved) */
export async function getShelterByUser(userId) {
  try {
    const { data, error } = await supabase
      .from("shelters")
      .select("*")
      .eq("admin_user_id", userId)
      .maybeSingle();

    return { data, error };
  } catch (err) {
    console.error("getShelterByUser error:", err);
    return { data: null, error: err };
  }
}

/** Admin: list pending shelter requests */
export async function listPendingShelterRequests() {
  try {
    const { data, error } = await supabase
      .from("shelters")
      .select("*")
      .eq("status", "pending")
      .order("created_at", { ascending: false });

    return { data, error };
  } catch (err) {
    console.error("listPendingShelterRequests error:", err);
    return { data: null, error: err };
  }
}

/** Admin: approve or reject shelter */
export async function updateShelterStatus(shelterId, updates = {}) {
  try {
    const { data, error } = await supabase
      .from("shelters")
      .update(updates)
      .eq("id", shelterId)
      .select()
      .single();

    // notify the shelter user that request was approved/rejected
    if (!error && data) {
      const type =
        updates.status === "approved"
          ? "shelter_approved"
          : updates.status === "rejected"
          ? "shelter_rejected"
          : null;

      if (type) {
        await createNotification({
          recipient_id: data.admin_user_id,
          recipient_type: "user",
          type,
          message:
            updates.status === "approved"
              ? `Your shelter "${data.name}" was approved.`
              : `Your shelter "${data.name}" was rejected.`,
          meta: { shelter_id: data.id },
        });
      }
    }

    return { data, error };
  } catch (err) {
    console.error("updateShelterStatus error:", err);
    return { data: null, error: err };
  }
}

