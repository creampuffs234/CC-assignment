import supabase from "../helper/supabaseClient";
import { calculateDistance } from "../utils/distance";

export async function getClosestShelter(lat, lng) {
  // Get all shelters with coordinates
  const { data: shelters, error } = await supabase
    .from("shelters")
    .select("id, name, email, latitude, longitude");

  if (error || !shelters) return null;

  let closest = null;
  let closestDistance = Infinity;

  shelters.forEach((s) => {
    if (!s.latitude || !s.longitude) return; // skip shelters without coordinates

    const dist = calculateDistance(lat, lng, s.latitude, s.longitude);

    if (dist < closestDistance) {
      closestDistance = dist;
      closest = { ...s, distance: dist };
    }
  });

  return closest;
}
