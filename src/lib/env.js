// Fail fast if Supabase env vars are missing.
// Validated at module import time — surfaces config errors at boot,
// not at first Supabase call.

const REQUIRED = ["VITE_SUPABASE_URL", "VITE_SUPABASE_ANON_KEY"];

const missing = REQUIRED.filter((key) => !import.meta.env[key]);
if (missing.length > 0) {
  throw new Error(
    `Missing required env vars: ${missing.join(", ")}. ` +
      `Copy .env.example to .env.local and fill in values from your Supabase project's API settings.`
  );
}

export const env = Object.freeze({
  supabase: {
    url: import.meta.env.VITE_SUPABASE_URL,
    anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY,
  },
});
