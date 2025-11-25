// src/services/adoptionService.js
import supabase from "../helper/supabaseClient";

export async function createAdoption(payload) {
  const { data, error } = await supabase
    .from("adoptions")
    .insert([payload])
    .select()
    .single();

  return { data, error };
}

export async function updateAdoptionStatus(id, fields) {
  const { data, error } = await supabase
    .from("adoptions")
    .update(fields)
    .eq("id", id)
    .select()
    .single();

  return { data, error };
}

export async function fetchAdoptionsForShelter(shelterId) {
  return supabase
    .from("adoptions")
    .select("*, animals(title)")
    .eq("shelter_id", shelterId);
}

export async function fetchAdoptionsForUser(userId) {
  return supabase
    .from("adoptions")
    .select("*, animals(title)")
    .eq("requester_id", userId);
}
