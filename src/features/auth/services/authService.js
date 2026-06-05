import { supabase } from "@services/supabase";

// displayName is passed via raw_user_meta_data so the on_auth_user_created
// trigger can copy it into public.profiles. Role is intentionally NOT set
// here — admins are promoted manually via the Supabase SQL editor.
export async function signUpWithEmail({ email, password, displayName }) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { display_name: displayName ?? "" },
    },
  });
  if (error) throw error;
  return data.user;
}

export async function signInWithEmail({ email, password }) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw error;
  return data.user;
}

export async function logout() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function updateProfile({ displayName }) {
  const { error } = await supabase.auth.updateUser({
    data: { display_name: displayName },
  });
  if (error) throw error;
}

export async function updatePassword({ newPassword }) {
  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) throw error;
}

export async function fetchUserStats() {
  const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();
  const [total, thisMonth, creatorRows] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("profiles").select("*", { count: "exact", head: true }).gte("created_at", monthStart),
    supabase.from("events").select("created_by"),
  ]);
  const creators = new Set(creatorRows.data?.map((r) => r.created_by)).size;
  return { total: total.count ?? 0, thisMonth: thisMonth.count ?? 0, creators };
}

export async function fetchRecentUsers() {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, email, display_name, role, created_at")
    .order("created_at", { ascending: false })
    .limit(10);
  if (error) throw error;
  return data ?? [];
}

export async function fetchTopCreators() {
  const { data: rows, error } = await supabase
    .from("events")
    .select("created_by")
    .not("created_by", "is", null);
  if (error) throw error;

  const counts = {};
  rows?.forEach((r) => { counts[r.created_by] = (counts[r.created_by] || 0) + 1; });
  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 8);
  if (sorted.length === 0) return [];

  const ids = sorted.map(([id]) => id);
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, email, display_name")
    .in("id", ids);

  return sorted.map(([id, count]) => ({
    id, count, ...profiles?.find((p) => p.id === id),
  }));
}
