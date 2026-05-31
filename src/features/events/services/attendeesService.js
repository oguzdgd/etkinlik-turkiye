import { supabase } from "@services/supabase";
import { toEvent } from "./eventsService";

const TABLE = "event_attendees";

// Composite primary key (event_id, user_id) on the table prevents duplicate
// joins at the database level — same guarantee as the Firestore composite ID.
export async function joinEvent(eventId, uid) {
  const { error } = await supabase
    .from(TABLE)
    .insert({ event_id: eventId, user_id: uid });
  if (error) throw error;
}

export async function leaveEvent(eventId, uid) {
  const { error } = await supabase
    .from(TABLE)
    .delete()
    .eq("event_id", eventId)
    .eq("user_id", uid);
  if (error) throw error;
}

export async function isJoined(eventId, uid) {
  const { count, error } = await supabase
    .from(TABLE)
    .select("event_id", { count: "exact", head: true })
    .eq("event_id", eventId)
    .eq("user_id", uid);
  if (error) throw error;
  return (count ?? 0) > 0;
}

// Events the user has joined, newest-join first.
export async function fetchUserJoinedEvents(uid) {
  const { data, error } = await supabase
    .from(TABLE)
    .select("joined_at, events!inner(*)")
    .eq("user_id", uid)
    .order("joined_at", { ascending: false });

  if (error) throw error;
  return data.map((row) => toEvent(row.events));
}

// Public attendee count via the `attendee_count` RPC (security definer).
// A direct count query can't be used anymore: RLS on event_attendees is
// self-only, so a plain count would return just the caller's own rows.
// The RPC returns only the aggregate total — never the user_id list.
// When this becomes too expensive, add an attendees_count column on events
// plus an AFTER INSERT/DELETE trigger on event_attendees to maintain it.
export async function fetchAttendeeCount(eventId) {
  const { data, error } = await supabase.rpc("attendee_count", {
    p_event_id: eventId,
  });
  if (error) throw error;
  return data ?? 0;
}
