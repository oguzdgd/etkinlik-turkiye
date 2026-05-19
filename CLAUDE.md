# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Response Protocol (Non-negotiable)

These rules apply to every response without exception:

1. **Truth Over Helpfulness** — Never guess, invent, assume, or fabricate. Accuracy over confidence.
2. **No Gap-Filling** — If information is missing or unclear, state it explicitly. Never fill gaps with plausible-sounding content.
3. **Expose Blind Spots** — List any information needed but not available. If none, state "None."
4. **No False Confidence** — Confidence levels: High (verified, no ambiguity) / Medium (generally reliable, minor uncertainty) / Low (significant uncertainty). If Low and critical info is missing, say so.
5. **No Invention** — Never fabricate names, numbers, dates, stats, sources, or events. Mark uncertainty as [UNKNOWN] or [UNVERIFIED]. Hypotheticals must be marked [HYPOTHETICAL].
6. **Cite Your Basis** — Always state: training knowledge / document provided / web search / combination.
7. **Pre-Delivery Review** — Before every answer: verify no invented info, all uncertainty flagged, confidence honest.

**Mandatory format for non-trivial answers:**
- Information I need but don't have: (bullet list, or "None")
- Confidence level: (High / Medium / Low + brief reason)
- Basis of answer: (training knowledge / document / web search / combination)
- Answer:

> Proje ilerlemesi, mimari kararlar ve yapılacaklar için **`process.md`** dosyasını oku.

## Commands

```bash
npm run dev      # Vite dev server — :5173
npm run build    # production build
npm run preview  # serve dist/
```

Schema değişiklikleri `supabase/schema.sql`'e yazılır, Supabase Dashboard → SQL Editor'dan çalıştırılır. Migration aracı yok.

## Architecture

### Feature-based structure

```
src/features/<name>/
  components/   # UI
  hooks/        # TanStack Query wrappers
  services/     # Supabase calls only
  lib/          # pure utilities (validation, geocode, format)
  index.js      # public barrel — pages import only from here
  queryKeys.js  # centralised cache keys
```

Mevcut feature'lar: `auth`, `events`, `favorites`

Two hard rules enforced by convention:
1. `@supabase/supabase-js` imports only inside `services/`. Everything else calls a service function.
2. Pages import from `@features/<name>` barrels, never from internal paths.
3. Cross-feature service imports yasak — ortak logic tekrar edilir (bkz. `favoritesService.js`'teki `mapEvent`).

### State

| Concern | Home |
|---|---|
| Server data | TanStack Query (`queryKeys.js` per feature) |
| Auth + role | `AuthContext` (`features/auth/context/`) |
| UI | Zustand (`src/store/uiStore.js`) |

`QueryClient` defaults: `staleTime: 60s`, `retry: 1`, `refetchOnWindowFocus: false`.

`AuthProvider` blocks the initial render until auth resolves — guards and Navbar never see a loading flash.

### Routing

`src/app/router.jsx` — `createBrowserRouter` + `route.lazy()`. Pages use `export default`; the `lazyPage` adapter converts them to `{ Component }`. Guards are layout routes with `<Outlet />`.

### Path aliases

Always use: `@app` `@pages` `@features` `@services` `@store` `@components` `@hooks` `@lib` `@/*`. No `../../` paths.

### Supabase

- Column names are `snake_case`; UI consumes `camelCase`. `toEvent` in `eventsService.js` (exported) ve `mapEvent` in `favoritesService.js` bu dönüşümü yapar.
- `approved` events are public (anonymous read). `pending`/`rejected` are owner + admin only.
- `favorites` tablosu owner-only RLS — anonim okuyamaz.
- Admin role is set via SQL: `update profiles set role = 'admin' where email = '...';`
- Realtime: tables must be added to `supabase_realtime` publication or channels silently never fire.

### Styling

Tailwind v4 via `@tailwindcss/vite`. No `tailwind.config.js` or `postcss.config.js` — config lives in `src/index.css`. Don't add v3-style config files.

Design system is **black & white / zinc palette only** — no color accents (no indigo, blue, green, etc. on new UI). Interactive elements: `bg-black text-white` (active) / `border-zinc-200` (default).

Custom CSS classes in `src/index.css`:
| Class | Purpose |
|---|---|
| `display-tight` | Display headings — tight letter-spacing |
| `tabular` | Tabular numbers |
| `nav-blur` | Backdrop blur for navbar |
| `stripe-placeholder` | Light stripe image fallback |
| `stripe-placeholder-dark` | Dark stripe image fallback |
| `card-hover` | translateY(-2px) lift on hover |
| `shadow-card` | Subtle card shadow |
| `shadow-lift` | Stronger hover shadow |
| `focus-ring` | Black 2px focus outline |
| `clamp-2` | 2-line text clamp |
| `hero-full-bleed` | Escapes `max-w-6xl` container + `px-4/px-6` padding → full 100vw width |

### Performance patterns

- Filter objects passed to `useDebounce` must be wrapped in `useMemo` at the call site to prevent reference-churn resetting the debounce timer.
- `pages.flatMap()` results in `EventList` are memoized with `useMemo(…, [data])`.
- `EventCard` is wrapped with `React.memo` — prevents re-render of all cards when `isFetchingNextPage` changes.
- Heavy computations inside page components (e.g., calendar grid cells) use `useMemo` with correct deps.
- All images use `loading="lazy"` except LCP candidates.
- Leaflet (190 kB) is in its own chunk via lazy `MapPage` route — never in the main bundle.
