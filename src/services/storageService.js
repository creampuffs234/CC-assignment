// src/services/storageService.js
import supabase from "../helper/supabaseClient";

/**
 * Upload an image to Supabase Storage
 * @param {File} file - File object from input type="file"
 * @returns {Object} { publicUrl, error }
 */
export async function uploadImage(file) {
  try {
    if (!file) return { error: "No file provided" };

    const filePath = `pets/${Date.now()}-${file.name}`;

    const { error: uploadError } = await supabase.storage
      .from("animal-images")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      return { error: uploadError.message };
    }

    const { data: urlData } = supabase.storage
      .from("animal-images")
      .getPublicUrl(filePath);

    return { publicUrl: urlData.publicUrl };
  } catch (err) {
    console.error("Storage error:", err);
    return { error: "Unexpected error while uploading image" };
  }
}

/**
 * Delete an image from Supabase Storage
 * @param {string} path - File path (ex: pets/12345-dog.jpg)
 * @returns {Object} { error }
 */
export async function deleteImage(path) {
  try {
    if (!path) return { error: "No file path provided" };

    const { error } = await supabase.storage
      .from("animal-images")
      .remove([path]);

    return { error };
  } catch (err) {
    console.error("Delete error:", err);
    return { error: "Unexpected error while deleting image" };
  }
}
