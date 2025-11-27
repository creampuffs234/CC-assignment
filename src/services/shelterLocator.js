// src/services/shelterLocator.js
import supabase from "../helper/supabaseClient";
import { calculateDistance } from "../utils/distance";

export async function getClosestShelter(lat, lng) {
  // Fetch shelters with the REAL columns your table has
  const { data: shelters, error } = await supabase
    .from("shelters")
    .select("id, email, phone, address, description, status, admin_user_id, latitude, longitude");

  if (error) {
    console.error("SHELTER FETCH ERROR:", error);
    return null;
  }

  if (!shelters || shelters.length === 0) {
    console.warn("NO SHELTERS RETURNED FROM DB");
    return null;
  }

  let closest = null;
  let closestDistance = Infinity;

  shelters.forEach((s) => {
    // Skip shelters missing coordinates
    if (!s.latitude || !s.longitude) return;

    const dist = calculateDistance(lat, lng, s.latitude, s.longitude);

    if (dist < closestDistance) {
      closestDistance = dist;
      closest = { ...s, distance: dist };
    }
  });

  return closest;
}
