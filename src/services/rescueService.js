// src/services/rescueService.js
import supabase from "../helper/supabaseClient";

export async function getRescueTeam() {
  return supabase
    .from("rescue_team")
    .select("*")
    .maybeSingle();
}

export async function addRescueStatus(report_id, status, note) {
  return supabase
    .from("rescue_status_updates")
    .insert([{ report_id, status, note }])
    .select()
    .single();
}

export async function updateReportStatus(report_id, status) {
  return supabase
    .from("pet_reports")
    .update({ status })
    .eq("id", report_id)
    .select()
    .single();
}

export async function sendRescueAlert(report, rescue) {
  return fetch(
    `${import.meta.env.VITE_SUPABASE_FUNCTIONS_URL}/rescue-alert`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ report, rescue })
    }
  );
}
