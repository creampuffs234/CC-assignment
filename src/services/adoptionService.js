import supabase from "../helper/supabaseClient";

export async function createAdoption(payload) {
  return await supabase
    .from("adoptions")
    .insert([payload])
    .select()
    .single();
}

export async function fetchAdoptionsForUser(userId) {
  return await supabase
    .from("adoptions")
    .select("*, animals(title, image_url)")
    .eq("requester_id", userId)
    .order("created_at", { ascending: false });
}

export async function fetchAdoptionsForShelter(shelterId) {
  return await supabase
    .from("adoptions")
    .select("*, animals(title, image_url)")
    .eq("shelter_id", shelterId)
    .order("created_at", { ascending: false });
}

export async function updateAdoptionStatus(id, fields) {
  return await supabase
    .from("adoptions")
    .update(fields)
    .eq("id", id)
    .select()
    .single();
}
