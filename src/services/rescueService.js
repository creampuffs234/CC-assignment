// src/services/rescueService.js
import supabase from "../helper/supabaseClient";

/**
 * Fetch rescue team members (if your system uses this)
 */
export async function getRescueTeam() {
  return supabase.from("rescue_team").select("*").maybeSingle();
}

/**
 * Insert a rescue status update row (history)
 */
export async function addRescueStatus(report_id, status, note) {
  const { data, error } = await supabase
    .from("rescue_status_updates")
    .insert([{ report_id, status, note }])
    .select()
    .single();
  return { data, error };
}

/**
 * Fetch all status history items for a report
 */
export async function fetchStatusHistory(report_id) {
  const { data, error } = await supabase
    .from("rescue_status_updates")
    .select("*")
    .eq("report_id", report_id)
    .order("created_at", { ascending: false });

  return { data, error };
}

/**
 * Update the main pet report status
 */
export async function updateReportStatus(report_id, status) {
  const { data, error } = await supabase
    .from("pet_reports")
    .update({ status })
    .eq("id", report_id)
    .select()
    .single();

  return { data, error };
}

/**
 * Email alert via Supabase Edge Function
 */
export async function sendRescueAlert(report, shelter) {
  return fetch(`${import.meta.env.VITE_SUPABASE_FUNCTIONS_URL}/rescue-alert`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ report, rescue: shelter }),
  });
}
