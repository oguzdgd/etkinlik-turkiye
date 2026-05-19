# process.md — Proje Takip & Rehber Dosyası

Bu dosya her oturumda güncellenir. Nerede kaldığımızı, ne bitti, ne eksik — buraya bakarak anlıyoruz.
Mimari kararlar, kurallar ve teknik notlar da burada.

---

## Komutlar

```bash
npm run dev        # Vite dev server — :5173
npm run build      # production build
npm run preview    # dist/ klasörünü serve et
```

Schema değişiklikleri `supabase/schema.sql` dosyasına yazılır, Supabase Dashboard → SQL Editor'dan çalıştırılır. Migration aracı yok — dosya idempotent yazılmış (`if not exists` / `drop policy if exists` / `on conflict do update`), yeniden çalıştırmak güvenli.

Test runner, lint script, Cloud Functions yok — bu MVP. `eslint` script'ini config eklemeden geri ekleme.

---

## Mimari

### Feature-based, sert sınırlarla

Kod domain özelliğine göre gruplanır (`src/features/<name>/`), dosya türüne göre değil. Her feature kendi `services/`, `hooks/`, `components/`, `lib/` klasörlerine sahip. `src/pages/` ince kabuklar — feature barrel'larından import ederler.

İki sınır kuralı:

1. **`@supabase/supabase-js` import'u sadece `services/` içinde.** Component ve hook'lar service fonksiyonu çağırır. Yeni Supabase davranışı gerekiyorsa önce `eventsService.js` / `attendeesService.js` / `authService.js`'e fonksiyon ekle, sonra hook'tan import et.
2. **Sayfalar feature barrel'larından import eder, iç yollardan değil.** `import { useEvents, EventList } from "@features/events"` — `@features/events/hooks/useEvents` değil.

### State ayrımı

- **Server state → TanStack Query.** Tüm Supabase read'leri. Query key'ler `queryKeys.js`'de merkezi. `QueryClient`: `staleTime: 60s`, `retry: 1`, `refetchOnWindowFocus: false`.
- **Session state → AuthContext.** `features/auth/context/AuthContext.jsx`. `onAuthStateChange` + `public.profiles` Realtime kanalı. İlk render bloklanır — downstream'de flash olmaz.
- **UI state → Zustand** (`src/store/uiStore.js`). Sidebar, theme, modal. Server/auth verisi buraya gelmez.

### Routing

`src/app/router.jsx` — `createBrowserRouter` + `route.lazy()`. `lazyPage` adapter: `import()` → `{ Component }` dönüşümü. Guard'lar layout route olarak sarmalanır (`ProtectedRoute`, `AdminRoute` → `<Outlet />`). `AuthProvider` ilk render'dan önce resolve ettiği için guard'ların kendi loading state'i yok.

### Path alias'ları

`vite.config.js` ve `jsconfig.json`'da tanımlı. Daima bunları kullan:

```
@app  @pages  @features  @services  @store  @components  @hooks  @lib  @/*
```

`../../` relative path kullanma.

### Supabase veri modeli

Dört tablo, hepsi `supabase/schema.sql`'de:

- **`profiles`** — `auth.users` uzantısı. `role` (`'user' | 'admin'`) auth source of truth. Admin promosyonu: `update profiles set role = 'admin' where email = '...'`. `on_auth_user_created` trigger'ı kayıt sırasında otomatik profil yaratır.
- **`events`** — `status`: `'pending' | 'approved' | 'rejected'`. Yeni etkinlik mecburen `pending` (RLS zorluyor). `type`: `'online'` (`online_url`) veya `'in_person'` (`city` + `location_text`). `events_protect_immutable` trigger'ı status/created_by değişimini admin dışında engeller.
- **`event_attendees`** — composite PK `(event_id, user_id)`. Public read (anonim ziyaretçi sayaç görebilir).
- **`favorites`** — composite PK `(user_id, event_id)`, owner-only RLS.

`snake_case` (Postgres) → `camelCase` (UI) dönüşümü sadece `eventsService.js`'teki `toEvent` mapper'da yapılır.

`approved` etkinlikler herkes tarafından okunur; `pending`/`rejected` sadece sahibi + admin.

**Storage:** `event-images` bucket, `{uid}/{file}` path'i. Owner-only write (path'teki UID policy'de eşleşiyor), public read.

### Realtime

`supabase_realtime` publication'a eklenmeyen tablo sessizce event atmaz. Şu an sadece `public.profiles` ekli. Yeni tablo eklenirken: `alter publication supabase_realtime add table public.<name>;`

### Pagination

`useEvents` — `useInfiniteQuery`, offset-based. `pageParam` numeric offset, `fetchEventsPage` → `.range(from, to)`. Büyük dataset'te keyset pagination'a geç (`gt('starts_at', lastSeenStartsAt)`).

### Optimistik mutation'lar

`useJoinEvent` — iki cache'i aynı anda mutate eder (`isJoined` + `attendeeCount`). `onMutate`'te ikisini snapshot al, `onError`'da ikisini restore et, `onSettled`'da ikisini invalidate et. Çok cache'i etkileyen mutation'larda bu kalıbı takip et.

`useModerateEvent` — tek cache variant. Pending listeden optimistik çıkar, hata → restore, onay → public `lists()` invalidate (red → public listeyi etkilemez).

### Event oluşturma akışı

`useCreateEvent` — iki adımlı mutation: önce cover image upload (opsiyonel), sonra `pending` olarak event row. Upload başarısız → row yaratılmaz. Form validation: `features/events/lib/validation.js` (`{ ok, errors }` döner). Form type-aware: online/in_person geçişi ilgisiz alanları temizler.

### Env vars

`src/lib/env.js`'de boot'ta validate edilir. Yeni zorunlu var → `REQUIRED` array'ine ekle. Başka yerde `import.meta.env.*` okuma. `.env.local` gitignore'da; `.env.example` shape'i belgeler.

### Styling

Tailwind v4 — `@tailwindcss/vite`. `tailwind.config.js` veya `postcss.config.js` yok, kasıtlı. Config `src/index.css`'te `@import "tailwindcss"` + `@theme`. v3-style config dosyalarını geri ekleme.

### Error handling

- `<ErrorBoundary>` (`providers.jsx`) — router dışındaki render hatalarını yakalar.
- `errorElement: <RouteError />` (layout route) — route hatalarını yakalar, navbar görünür kalır. Hem `isRouteErrorResponse` (4xx/5xx) hem arbitrary hataları handle eder.

Kendi data loading'i olan yeni route'a kendi `errorElement`'ini ver.

---

## Mevcut Durum (2026-05-08)

**Tasarım sistemi uygulandı.** Siyah-beyaz/zinc palette, özel CSS sınıfları, tam ekran hero. Ana sayfa, Kategoriler, Şehirler, Takvim sayfaları tamamlandı. Tüm bundle performans optimizasyonları yapıldı.

Email import pipeline kuruldu: Gmail OAuth2 → Groq (Llama 3.3-70b) → Supabase pending events. Cron her 6 saatte çalışıyor. Test aşamasında — dedicated etkinlik maili açılınca production'a geçecek.

---

## Tamamlananlar

### Altyapı
- [x] Vite + React + Tailwind v4 kurulumu
- [x] TanStack Query, Zustand, React Router
- [x] Path aliases, env validation, Supabase client
- [x] Error boundary + `<RouteError />`

### Auth Feature (`src/features/auth/`)
- [x] `authService.js` — signIn, signUp, signOut
- [x] `AuthContext.jsx` — onAuthStateChange + Realtime profiles aboneliği, render bloke
- [x] `ProtectedRoute`, `AdminRoute`
- [x] Login, Register sayfaları

### Events Feature (`src/features/events/`)
- [x] `eventsService.js` — fetchEventsPage, fetchEventById, createEvent, moderateEvent, `toEvent` mapper
- [x] `attendeesService.js` — fetchAttendeeCount, isUserJoined, joinEvent, leaveEvent
- [x] `storageService.js` — uploadEventImage
- [x] `queryKeys.js` — eventKeys (list, detail, attendeeCount, isJoined, pending)
- [x] Hooklar: `useEvents`, `useEventDetail`, `useAttendeeCount`, `useIsJoined`, `useJoinEvent`, `useCreateEvent`, `usePendingEvents`, `useModerateEvent`
- [x] Bileşenler: `EventCard`, `EventList`, `JoinButton`, `AttendeeCount`, `EventCreateForm`, `PendingEventList`, `PendingEventRow`
- [x] Sayfalar: `EventListPage`, `EventDetailPage`, `EventCreatePage`

### Admin
- [x] `AdminDashboardPage` — pending etkinlik moderasyon arayüzü
- [x] Optimistik moderation: pending listeden anlık çıkarma, onay → public list invalidation

### Harita Feature (`react-leaflet@4 + leaflet`)
- [x] `events` tablosuna `lat`, `lng` kolonları eklendi (schema + ALTER TABLE)
- [x] `fetchEventsForMap` — sadece approved + in_person + koordinatı olan etkinlikler
- [x] `useEventsForMap` hook
- [x] `EventMap.jsx` — OpenStreetMap tile, marker + popup (başlık, tarih, detay linki)
- [x] `MapPage.jsx` — `/events/map` rotası
- [x] `geocode.js` — Nominatim ile otomatik geocoding (city + locationText → lat/lng)
- [x] `useCreateEvent` — in_person etkinlik oluştururken arka planda geocode, kullanıcı koordinat girmiyor

### Router
- [x] `createBrowserRouter` + `route.lazy()` + `lazyPage` adapter
- [x] Rotalar: `/`, `/login`, `/register`, `/categories`, `/cities`, `/calendar`, `/events`, `/events/map`, `/events/:eventId`, `/dashboard`, `/profile`, `/events/new`, `/admin`

### Supabase Schema
- [x] 4 tablo: `profiles`, `events`, `event_attendees`, `favorites`
- [x] RLS politikaları, triggerlar (`on_auth_user_created`, `events_protect_immutable`)
- [x] Storage bucket `event-images` + politikaları
- [x] Realtime: `profiles` publication'a eklendi

---

## Eksik / Yapılacaklar

### Favorites Feature
- [x] `favoritesService.js` — fetchUserFavoriteIds, addFavorite, removeFavorite
- [x] `useFavorites` — kullanıcının favori event_id'lerini Set olarak döner
- [x] `useToggleFavorite` — optimistik toggle (Set üzerinde)
- [x] `FavoriteButton` bileşeni (EventCard image'ının sağ üstünde)
- [x] `favoriteKeys` — `src/features/favorites/queryKeys.js`
- [x] EventCard entegrasyonu
- [x] DashboardPage'de favori etkinlikler listesi

### Kullanıcı Dashboard (`/dashboard`)
- [x] Kullanıcının kendi etkinlikleri (pending/approved/rejected durumlarıyla) — `useUserEvents`
- [x] Favori etkinlikler listesi — `useUserFavoriteEvents`
- [x] Katıldığı etkinlikler listesi — `useUserJoinedEvents`
- [x] 3 tab'lı UI: Etkinliklerim / Favorilerim / Katıldıklarım

### Küçük Eksikler
- [x] `useLeaveEvent` hook'u — optimistik (isJoined + attendeeCount + userJoined cache günceller)
- [x] EventDetailPage'de "etkinlikten ayrıl" — JoinButton zaten toggle olarak çalışıyor ("Katıldın · Ayrıl")
- [x] Dashboard Katıldıklarım tab'ında her satırda "Ayrıl" butonu

### Ana Sayfa Keşif + Navbar + Profil (2026-05-06)
- [x] `fetchEventsPage` filtre desteği — search (ilike title), type (eq), city (ilike), category (eq)
- [x] `useEvents` — filters parametresi + query key'e dahil (her filtre kombinasyonu ayrı cache)
- [x] `EventFilters.jsx` — arama input, şehir input, kategori select, tür pill butonları
- [x] `useDebounce` hook — `src/hooks/useDebounce.js`, 300ms gecikme
- [x] `EventList` — filters prop eklendi
- [x] `HomePage` — etkinlik keşif sayfası (filtre state + debounce + EventList)
- [x] `/events` → `/` redirect (Navigate replace)
- [x] `ROUTES.EVENTS` → `/`, `ROUTES.PROFILE` eklendi
- [x] Navbar dropdown — giriş yapmamışsa Giriş/Kayıt butonları; giriş yapmışsa kullanıcı adı + dropdown
- [x] Dropdown içeriği: Etkinlik Oluştur, Panelim, Profilim, Admin (admin rolüne göre), Çıkış yap
- [x] `updateProfile` / `updatePassword` — authService'e eklendi (`supabase.auth.updateUser`)
- [x] `useUpdateProfile` / `useUpdatePassword` hook'ları
- [x] `ProfileForm.jsx` — initials avatar, display name düzenleme, şifre değiştirme
- [x] `ProfilePage.jsx` — `/profile` ProtectedRoute altında

### Tasarım Sistemi + Yeni Sayfalar (2026-05-08)

**Design system:**
- [x] Siyah-beyaz / zinc palette — tüm renk aksanlar kaldırıldı
- [x] `src/index.css` — özel sınıflar: `display-tight`, `tabular`, `nav-blur`, `stripe-placeholder`, `stripe-placeholder-dark`, `card-hover`, `shadow-card`, `shadow-lift`, `focus-ring`, `clamp-2`, `hero-full-bleed`
- [x] `Navbar.jsx` — sticky + `nav-blur`, "ET" monogram, 5 nav linki (Keşfet, Kategoriler, Şehirler, Takvim, Harita), zengin kullanıcı dropdown
- [x] `MainLayout.jsx` — Footer 4 sütun grid + B&W logo, `overflow-x-hidden` (hero bleed için)
- [x] `EventCard.jsx` — `rounded-2xl`, `shadow-card`, `card-hover`, stripe placeholder, konum chip, outlined kategori badge
- [x] `EventFilters.jsx` — search + pin icon, `rounded-xl` input, siyah aktif pill butonlar
- [x] `EventList.jsx` — dashed border empty state, spinner-in-button load more
- [x] `FavoriteButton.jsx` — `bg-black/white` toggle, `rounded-full`

**Hero:**
- [x] `hero-full-bleed` CSS sınıfı — `width: 100vw` + `calc()` ile hem `px-4/px-6` hem `max-w-6xl` (72rem) container'dan kaçar
- [x] `HomePage` hero'su tam genişlik (`-mt-8 hero-full-bleed`), tam yükseklik (`min-h-[calc(100vh-4rem)]`)
- [x] Hero stats gerçek veri: `useEventStats` (Supabase count), `EVENT_CATEGORIES.length`, `CITY_COUNT=7`

**Yeni servisler/hooklar:**
- [x] `fetchEventStats` — approved etkinlik sayısı (HEAD isteği, veri döndürmez)
- [x] `useEventStats` — `staleTime: 5dk`, hero stats için
- [x] `fetchEventsForCalendar(year, month)` — belirli ayın approved etkinlikleri
- [x] `useEventsForCalendar(year, month)` — takvim sayfası için
- [x] `eventKeys.calendar(year, month)` — query key

**Yeni sayfalar:**
- [x] `CategoriesPage.jsx` (`/categories`) — EVENT_CATEGORIES editorial grid, açıklama blurb'ler, `/?category=X` linkleri
- [x] `CitiesPage.jsx` (`/cities`) — 7 şehir (İST/ANK/İZM/BUR/AYT/ESK/ONL), stripe-placeholder cover, `/?city=X` linkleri
- [x] `CalendarPage.jsx` (`/calendar`) — gerçek Supabase verisi, Pazartesi-başlangıçlı grid, gün seçim paneli, `useMemo` eventsByDate + cells
- [x] Router: `/categories`, `/cities`, `/calendar` rotaları eklendi

### Performans Optimizasyonları (2026-05-08)
- [x] `HomePage` — filter objesi `useMemo` ile sarıldı (debounce timer'ın stats yüklemesinde sıfırlanması engellendi)
- [x] `EventList` — `pages.flatMap()` `useMemo(…,[data])` ile memoize edildi
- [x] `EventCard` — `React.memo` ile sarıldı (`isFetchingNextPage` değişiminde 12 kartın gereksiz re-render'ı engellendi)
- [x] `CalendarPage` — `cells` array `useMemo(…,[year,month])` ile memoize edildi (gün seçimlerinde gereksiz ~42 eleman yeniden hesaplama engellendi)
- [x] `EventDetailPage` — hero image'a `loading="lazy"` eklendi
- [x] Bundle analizi: Leaflet 190 kB ayrı chunk'ta (MapPage lazy), ana bundle 135 kB gzip — temiz
