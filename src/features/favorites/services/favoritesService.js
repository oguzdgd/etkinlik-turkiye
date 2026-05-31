import { supabase } from "@services/supabase";

const TABLE = "favorites";

export async function fetchUserFavoriteIds(uid) {
  const { data, error } = await supabase
    .from(TABLE)
    .select("event_id")
    .eq("user_id", uid);

  if (error) throw error;
  return data.map((row) => row.event_id);
}

export async function addFavorite(uid, eventId) {
  const { error } = await supabase
    .from(TABLE)
    .insert({ user_id: uid, event_id: eventId });

  if (error) throw error;
}

export async function removeFavorite(uid, eventId) {
  const { error } = await supabase
    .from(TABLE)
    .delete()
    .eq("user_id", uid)
    .eq("event_id", eventId);

  if (error) throw error;
}

// Full event objects for the user's favorited events.
export async function fetchUserFavoriteEvents(uid) {
  const { data, error } = await supabase
    .from(TABLE)
    .select("created_at, events!inner(*)")
    .eq("user_id", uid)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data.map((row) => mapEvent(row.events));
}

export function mapEvent(row) {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    category: row.category,
    type: row.type,
    city: row.city,
    locationText: row.location_text,
    onlineUrl: row.online_url,
    lat: row.lat ?? null,
    lng: row.lng ?? null,
    startsAt: row.starts_at,
    imageURL: row.image_url,
    status: row.status,
    createdBy: row.created_by,
    createdAt: row.created_at,
    moderatedAt: row.moderated_at,
  };
}
