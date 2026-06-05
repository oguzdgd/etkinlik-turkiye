import { supabase } from "@services/supabase";
import { EVENT_STATUS } from "@lib/constants";

const TABLE = "events";

// Public listing — only "approved" events come back so this query works for
// anonymous visitors too. Pagination is offset-based via .range(from, to);
// the cursor is a numeric offset (consumed by useInfiniteQuery).
export async function fetchEventsPage({ pageSize = 12, cursor = 0, filters = {} } = {}) {
  const from = cursor;
  const to = cursor + pageSize - 1;

  const todayISO = new Date(new Date().toISOString().slice(0, 10)).toISOString();

  // Only the columns EventCard renders — `description` (the heavy import-generated
  // field) and other detail-only columns are skipped to keep this public,
  // high-traffic query light. The full row is fetched by fetchEventById on detail.
  let query = supabase
    .from(TABLE)
    .select("id, title, category, type, city, image_url, starts_at, ends_at, time_tbd, application_deadline")
    .eq("status", EVENT_STATUS.APPROVED)
    .range(from, to);

  // Date range filter.
  // Explicit user filter (Bugün/Bu Hafta/Bu Ay pills): filter by starts_at only.
  // Default (no filter): exclude fully-past events — show if not started yet OR
  // multi-day and still ongoing (ends_at >= today).
  if (filters.dateFrom) {
    query = query.gte("starts_at", filters.dateFrom);
    if (filters.dateTo) query = query.lte("starts_at", filters.dateTo);
  } else {
    query = query.or(`starts_at.gte.${todayISO},ends_at.gte.${todayISO}`);
  }

  // Sorting
  if (filters.sortBy === "newest") {
    query = query.order("created_at", { ascending: false });
  } else if (filters.sortBy === "date_desc") {
    query = query.order("starts_at", { ascending: false });
  } else {
    query = query.order("starts_at", { ascending: true });
  }

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
  const todayISO = new Date(new Date().toISOString().slice(0, 10)).toISOString();
  const { data, error } = await supabase
    .from(TABLE)
    .select("id, title, starts_at, lat, lng")
    .eq("status", EVENT_STATUS.APPROVED)
    .eq("type", "in_person")
    .not("lat", "is", null)
    .not("lng", "is", null)
    .gte("starts_at", todayISO)
    .order("starts_at", { ascending: true });

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
export async function createEvent({ uid, startsAt, endsAt, timeTbd, applicationDeadline, ...payload }) {
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
      starts_at: startsAt instanceof Date ? startsAt.toISOString() : startsAt,
      ends_at: endsAt ? (endsAt instanceof Date ? endsAt.toISOString() : endsAt) : null,
      time_tbd: timeTbd ?? false,
      application_deadline: applicationDeadline
        ? (applicationDeadline instanceof Date ? applicationDeadline.toISOString() : applicationDeadline)
        : null,
      image_url: payload.imageURL || null,
      website_url: payload.websiteUrl || null,
      status: EVENT_STATUS.PENDING,
      created_by: uid,
    })
    .select("id")
    .single();

  if (error) throw error;
  return data.id;
}

// Owner edit — always resets status to pending for re-moderation.
// The events_protect_immutable_fields trigger allows this specific transition.
export async function updateEvent(eventId, { uid, startsAt, endsAt, timeTbd, applicationDeadline, lat, lng, imageURL, ...payload }) {
  const { error } = await supabase
    .from(TABLE)
    .update({
      title: payload.title,
      description: payload.description,
      category: payload.category,
      type: payload.type,
      city: payload.city || null,
      location_text: payload.locationText || null,
      online_url: payload.onlineUrl || null,
      lat: lat ?? null,
      lng: lng ?? null,
      starts_at: startsAt instanceof Date ? startsAt.toISOString() : startsAt,
      ends_at: endsAt ? (endsAt instanceof Date ? endsAt.toISOString() : endsAt) : null,
      time_tbd: timeTbd ?? false,
      application_deadline: applicationDeadline
        ? (applicationDeadline instanceof Date ? applicationDeadline.toISOString() : applicationDeadline)
        : null,
      image_url: imageURL || null,
      website_url: payload.websiteUrl || null,
      status: EVENT_STATUS.PENDING,
      moderated_at: null,
    })
    .eq("id", eventId)
    .eq("created_by", uid);

  if (error) throw error;
}

// Owner can delete any of their own events; RLS enforces this on the server too.
export async function deleteEvent(eventId, uid) {
  const { error } = await supabase
    .from(TABLE)
    .delete()
    .eq("id", eventId)
    .eq("created_by", uid);

  if (error) throw error;
}

// Only admins can hit this — the events_protect_immutable trigger on the
// server raises if a non-admin tries to change status.
export async function setEventStatus(eventId, status, reason = null) {
  const { error } = await supabase
    .from(TABLE)
    .update({
      status,
      moderated_at: new Date().toISOString(),
      rejection_reason: status === "rejected" ? (reason || null) : null,
    })
    .eq("id", eventId);

  if (error) throw error;
}

// Detailed stats for the admin dashboard — runs parallel count queries.
export async function fetchAdminStats() {
  const [approved, pending, rejected, users] = await Promise.all([
    supabase.from(TABLE).select("*", { count: "exact", head: true }).eq("status", EVENT_STATUS.APPROVED),
    supabase.from(TABLE).select("*", { count: "exact", head: true }).eq("status", EVENT_STATUS.PENDING),
    supabase.from(TABLE).select("*", { count: "exact", head: true }).eq("status", EVENT_STATUS.REJECTED),
    supabase.from("profiles").select("*", { count: "exact", head: true }),
  ]);
  return {
    approved: approved.count ?? 0,
    pending:  pending.count  ?? 0,
    rejected: rejected.count ?? 0,
    total:    (approved.count ?? 0) + (pending.count ?? 0) + (rejected.count ?? 0),
    users:    users.count ?? 0,
  };
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
    .select("id, title, starts_at, ends_at, time_tbd, application_deadline, type, city, category")
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
    endsAt: row.ends_at ?? null,
    timeTbd: row.time_tbd ?? false,
    applicationDeadline: row.application_deadline ?? null,
    imageURL: row.image_url,
    websiteUrl: row.website_url ?? null,
    status: row.status,
    createdBy: row.created_by,
    createdAt: row.created_at,
    moderatedAt: row.moderated_at,
    rejectionReason: row.rejection_reason ?? null,
  };
}
