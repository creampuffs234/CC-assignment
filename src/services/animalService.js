// src/services/animalService.js
import supabase from "../helper/supabaseClient";

/**
 * fetch animals with optional filters
 * filters: { species, breed, search }
 */
export async function fetchAnimals({ species, breed, search } = {}) {
  let query = supabase
    .from("animals")
    .select("id,title,description,species,breed,age,gender,image_url,shelter_id,owner_name,is_active,created_at")
    .eq("is_active", true);

  if (species) query = query.eq("species", species);
  if (breed) query = query.ilike("breed", `%${breed}%`);
  if (search) {
    // search title/description
    query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
  }

  const { data, error } = await query.order("created_at", { ascending: false });
  return { data, error };
}

export async function getAnimalById(id) {
  const { data, error } = await supabase
    .from("animals")
    .select("*, shelters(name,email,phone,address)")
    .eq("id", id)
    .single();
  return { data, error };
}

export async function createAnimal(payload) {
  // payload should contain: title, description, species, breed, age, gender, image_url, shelter_id/null, owner_id/null, owner_name
  const { data, error } = await supabase.from("animals").insert([payload]).select().single();
  return { data, error };
}

export async function fetchBreedsBySpecies(species) {
  // simple method: fetch distinct breeds for a species
  const { data, error } = await supabase
    .from("animals")
    .select("breed")
    .eq("species", species)
    .neq("breed", null)
    .limit(200);
  if (error) return { data: [], error };
  const unique = Array.from(new Set((data || []).map((r) => r.breed))).filter(Boolean);
  return { data: unique, error: null };
}
