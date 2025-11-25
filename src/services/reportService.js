// src/services/reportService.js
import supabase from "../helper/supabaseClient";

/**
 * createReport(payload)
 * payload: { user_id, report_type, pet_type, location, description, image_url }
 */
export async function createReport(payload) {
  const { data, error } = await supabase
    .from("pet_reports")
    .insert([payload])
    .select()
    .single();
  return { data, error };
}

export async function fetchOpenReports() {
  const { data, error } = await supabase
    .from("pet_reports")
    .select("*")
    .eq("status", "open")
    .order("created_at", { ascending: false });
  return { data, error };
}

export async function fetchReportById(id) {
  const { data, error } = await supabase
    .from("pet_reports")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  return { data, error };
}
