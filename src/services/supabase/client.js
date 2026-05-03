import { createClient } from "@supabase/supabase-js";
import { env } from "@lib/env";

// Single shared client. Auth token is stored in localStorage by default
// (persistSession: true) so reloads keep the user signed in.
export const supabase = createClient(env.supabase.url, env.supabase.anonKey);
