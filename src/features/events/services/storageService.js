import { supabase } from "@services/supabase";

const BUCKET = "event-images";

// Uploads to {uid}/{timestamp}_{safeName} inside the public `event-images`
// bucket. The {uid} prefix is what the bucket policy matches on for write
// authorisation — see schema.sql.
export async function uploadEventImage(file, uid) {
  if (!file) return null;

  const safeName = file.name.replace(/[^\w.-]+/g, "_");
  const path = `${uid}/${Date.now()}_${safeName}`;

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, {
      contentType: file.type,
      cacheControl: "3600",
      upsert: false,
    });
  if (uploadError) throw uploadError;

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}
