import { supabase } from "@services/supabase";
import { EVENT_STATUS } from "@lib/constants";

const TABLE = "events";

// Public listing — only "approved" events come back so this query works for
// anonymous visitors too. Pagination is offset-based via .range(from, to);
// the cursor is a numeric offset (consumed by useInfiniteQuery).
export async function fetchEventsPage({ pageSize = 12, cursor = 0, filters = {} } = {}) {
  const from = cursor;
  const to = cursor + pageSize - 1;

  let query = supabase
    .from(TABLE)
    .select("*")
    .eq("status", EVENT_STATUS.APPROVED)
    .order("starts_at", { ascending: true })
    .range(from, to);

  if (filters.search) query = query.ilike("title", `%${filters.search}%`);
  if (filters.type && filters.type !== "all") query = query.eq("type", filters.type);
  if (filters.city) query = query.ilike("city", `%${filters.city}%`);
  if (filters.category) query = query.eq("category", filters.category);

  const { data, error } = await query;
  if (error) throw error;

  return {
    items: data.map(toEvent),
    nextCursor: data.length === pageSize ? cursor + pageSize : null,
  };
}

// Admin moderation queue — newest pending submissions first.
export async function fetchPendingEvents({ pageSize = 50 } = {}) {
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .eq("status", EVENT_STATUS.PENDING)
    .order("created_at", { ascending: false })
    .limit(pageSize);

  if (error) throw error;
  return data.map(toEvent);
}

export async function fetchEventById(eventId) {
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .eq("id", eventId)
    .maybeSingle();

  if (error) throw error;
  return data ? toEvent(data) : null;
}

// Approved in-person events that have coordinates — used by the map view.
export async function fetchEventsForMap() {
  const { data, error } = await supabase
    .from(TABLE)
    .select("id, title, starts_at, lat, lng")
    .eq("status", EVENT_STATUS.APPROVED)
    .eq("type", "in_person")
    .not("lat", "is", null)
    .not("lng", "is", null);

  if (error) throw error;
  return data.map((row) => ({
    id: row.id,
    title: row.title,
    startsAt: row.starts_at,
    lat: row.lat,
    lng: row.lng,
  }));
}

// Born "pending" — RLS enforces this on the server too, so this is defence
// in depth, not just convenience.
export async function createEvent({ uid, startsAt, ...payload }) {
  const { data, error } = await supabase
    .from(TABLE)
    .insert({
      title: payload.title,
      description: payload.description,
      category: payload.category,
      type: payload.type,
      city: payload.city || null,
      location_text: payload.locationText || null,
      online_url: payload.onlineUrl || null,
      lat: payload.lat || null,
      lng: payload.lng || null,
      starts_at: startsAt.toISOString(),
      image_url: payload.imageURL || null,
      status: EVENT_STATUS.PENDING,
      created_by: uid,
    })
    .select("id")
    .single();

  if (error) throw error;
  return data.id;
}

// Only admins can hit this — the events_protect_immutable trigger on the
// server raises if a non-admin tries to change status.
export async function setEventStatus(eventId, status) {
  const { error } = await supabase
    .from(TABLE)
    .update({
      status,
      moderated_at: new Date().toISOString(),
    })
    .eq("id", eventId);

  if (error) throw error;
}

// Lightweight stats for the hero section.
export async function fetchEventStats() {
  const { count, error } = await supabase
    .from(TABLE)
    .select("*", { count: "exact", head: true })
    .eq("status", EVENT_STATUS.APPROVED);

  if (error) throw error;
  return { eventCount: count ?? 0 };
}

// Approved events for a given month — used by the calendar view.
export async function fetchEventsForCalendar(year, month) {
  const from = new Date(year, month, 1).toISOString();
  const to = new Date(year, month + 1, 0, 23, 59, 59, 999).toISOString();

  const { data, error } = await supabase
    .from(TABLE)
    .select("id, title, starts_at, type, city, category")
    .eq("status", EVENT_STATUS.APPROVED)
    .gte("starts_at", from)
    .lte("starts_at", to)
    .order("starts_at");

  if (error) throw error;
  return data.map(toEvent);
}

// User's own events — all statuses, newest first.
export async function fetchUserEvents(uid) {
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .eq("created_by", uid)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data.map(toEvent);
}

// Maps snake_case Postgres columns to the camelCase shape the UI consumes.
// Keep this the only place that knows the column names.
export function toEvent(row) {
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
