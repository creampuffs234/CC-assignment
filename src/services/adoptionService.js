// src/services/adoptionService.js
import supabase from "../helper/supabaseClient";

// Create adoption request
export async function createAdoption(payload) {
  // Fetch animal owner + shelter
  const { data: animal, error: animalErr } = await supabase
    .from("animals")
    .select("owner_id, shelter_id, title")
    .eq("id", payload.animal_id)
    .single();

  if (animalErr) return { data: null, error: animalErr };

  const fullPayload = {
    ...payload,
    owner_id: animal.owner_id,
    shelter_id: animal.shelter_id,
    status: "pending",
  };

  const { data, error } = await supabase
    .from("adoptions")
    .insert([fullPayload])
    .select()
    .single();

  return { data, error };
}

// Requester sees ONLY their own
export async function fetchAdoptionsForUser(userId) {
  const { data, error } = await supabase
    .from("adoptions")
    .select("*, animals(title, image_url)")
    .eq("requester_id", userId)
    .order("created_at", { ascending: false });

  return { data, error };
}

// Shelter sees requests for their animals
export async function fetchAdoptionsForShelter(adminUserId) {
  const { data, error } = await supabase
    .from("adoptions")
    .select("*, animals(title, image_url)")
    .in(
      "animal_id",
      supabase
        .from("animals")
        .select("id")
        .eq("shelter_id", 
          supabase
            .from("shelters")
            .select("id")
            .eq("admin_user_id", adminUserId)
        )
    );

  return { data, error };
}

// Update status
export async function updateAdoptionStatus(id, fields) {
  const { data, error } = await supabase
    .from("adoptions")
    .update(fields)
    .eq("id", id)
    .select()
    .single();

  return { data, error };
}

