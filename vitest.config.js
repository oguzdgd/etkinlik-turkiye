import { defineConfig } from "vitest/config";
import viteConfig from "./vite.config.js";

// Reuse the Vite path aliases (@features, @services, @lib, …) so test files
// import exactly like app code does — but skip the React/Tailwind plugins,
// which the pure-Node service tests don't need.
export default defineConfig({
  resolve: viteConfig.resolve,
  test: {
    environment: "node",
    globals: true,
    include: ["src/**/*.{test,spec}.{js,jsx}"],
    // The Supabase client is created at module-import time and `@lib/env`
    // throws if these are missing. Dummy values are enough — no network
    // call happens at construction.
    env: {
      VITE_SUPABASE_URL: "http://localhost:54321",
      VITE_SUPABASE_ANON_KEY: "test-anon-key",
    },
  },
});
