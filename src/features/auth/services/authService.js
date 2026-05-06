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
