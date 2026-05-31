-- Etkinlik Türkiye — Supabase schema
--
-- Bu dosyayı Supabase Dashboard → SQL Editor'da TEK SEFERDE çalıştır.
-- Idempotent değildir; tabloları drop'layıp baştan yaratır.
-- Mevcut veri varsa kaybolur — boş projede kullanılmak üzere yazılmıştır.

-- =============================================================================
-- TABLES
-- =============================================================================

-- profiles: auth.users tablosunun uygulama tarafındaki uzantısı.
-- role buradan okunur — admin promosyonu bu tablodan yapılır.
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  display_name text,
  role text not null default 'user' check (role in ('user', 'admin')),
  created_at timestamptz not null default now()
);

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null,
  category text not null,
  type text not null check (type in ('online', 'in_person', 'hybrid')),
  city text,
  location_text text,
  online_url text,
  lat double precision,
  lng double precision,
  starts_at timestamptz not null,
  ends_at timestamptz,
  time_tbd boolean not null default false,
  application_deadline timestamptz,
  image_url text,
  website_url text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_by uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  moderated_at timestamptz,
  rejection_reason text
);

-- Mevcut veritabanına sütunları eklemek için (tablo zaten varsa):
alter table public.events add column if not exists lat double precision;
alter table public.events add column if not exists lng double precision;
alter table public.events add column if not exists source text not null default 'manual' check (source in ('manual', 'email_import'));
alter table public.events add column if not exists email_message_id text unique;
alter table public.events add column if not exists ends_at timestamptz;
alter table public.events add column if not exists website_url text;
alter table public.events add column if not exists time_tbd boolean not null default false;
alter table public.events add column if not exists application_deadline timestamptz;
alter table public.events add column if not exists rejection_reason text;

-- hybrid tip desteği — mevcut constraint'i drop edip yeniden ekle
alter table public.events drop constraint if exists events_type_check;
alter table public.events add constraint events_type_check
  check (type in ('online', 'in_person', 'hybrid'));

-- URL alanları sadece http(s) olabilir — javascript:/data: gibi şemalarla
-- stored XSS'i DB seviyesinde engeller. Client validation bypass edilebilir
-- (anon key public, PostgREST'e doğrudan istek atılabilir) — bu yüzden
-- defense-in-depth olarak DB'de zorlanır.
-- NOT: Mevcut veride http(s) olmayan URL varsa bu constraint EKLENMEZ; önce
-- temizle. Bu yüzden 'not valid' + ayrı validate ile eklenir: yeni/güncellenen
-- satırlar hemen zorlanır, mevcut satırlar validate adımında kontrol edilir.
alter table public.events drop constraint if exists events_urls_http;
alter table public.events add constraint events_urls_http check (
  (website_url is null or website_url ~* '^https?://')
  and (online_url is null or online_url ~* '^https?://')
  and (image_url is null or image_url ~* '^https?://')
) not valid;
-- Mevcut satırları da doğrula (ihlal varsa burada hata verir → önce veriyi düzelt):
alter table public.events validate constraint events_urls_http;

create index if not exists events_status_starts_at_idx
  on public.events(status, starts_at);
create index if not exists events_status_created_at_idx
  on public.events(status, created_at desc);

create table if not exists public.event_attendees (
  event_id uuid not null references public.events(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  joined_at timestamptz not null default now(),
  primary key (event_id, user_id)
);

create index if not exists event_attendees_user_id_idx
  on public.event_attendees(user_id);

create table if not exists public.favorites (
  user_id uuid not null references auth.users(id) on delete cascade,
  event_id uuid not null references public.events(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, event_id)
);

create index if not exists favorites_event_id_idx
  on public.favorites(event_id);

-- =============================================================================
-- HELPERS
-- =============================================================================

-- is_admin: RLS politikalarında admin kontrolü için yardımcı.
-- security definer + sabit search_path ile güvenli sorgu.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists(
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- =============================================================================
-- TRIGGERS
-- =============================================================================

-- Yeni auth.users satırı yaratıldığında otomatik profil oluştur.
-- display_name signup sırasında raw_user_meta_data'ya konabilir.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, display_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'display_name', '')
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Owner kendi etkinliğinin status veya created_by alanını değiştiremesin.
-- İstisna: owner kendi etkinliğini 'pending'e resetleyebilir (edit → resubmit).
-- Sadece admin diğer status geçişlerini yapabilir.
create or replace function public.events_protect_immutable_fields()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    if new.status is distinct from old.status then
      -- Owner sadece kendi etkinliğini 'pending'e resetleyebilir
      if not (new.status = 'pending' and auth.uid() = old.created_by) then
        raise exception 'Sadece admin status değiştirebilir.';
      end if;
    end if;
    if new.created_by is distinct from old.created_by then
      raise exception 'created_by değiştirilemez.';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists events_protect_immutable on public.events;
create trigger events_protect_immutable
  before update on public.events
  for each row execute function public.events_protect_immutable_fields();

-- =============================================================================
-- ROW LEVEL SECURITY
-- =============================================================================

alter table public.profiles enable row level security;
alter table public.events enable row level security;
alter table public.event_attendees enable row level security;
alter table public.favorites enable row level security;

-- profiles --------------------------------------------------------------------
-- Kullanıcı kendi profilini okur, admin tüm profilleri okur.
drop policy if exists "profiles_select" on public.profiles;
create policy "profiles_select" on public.profiles
  for select using (
    auth.uid() = id or public.is_admin()
  );

-- Kullanıcı kendi profilini günceller. DİKKAT: RLS politikası satır sahipliğini
-- kontrol eder ama hangi sütunların değiştiğini kısıtlamaz — yani bu politika
-- tek başına kullanıcının kendi 'role' alanını 'admin' yapmasını engelleyemez.
-- Privilege escalation'ı önlemek için 'role' sütununda UPDATE yetkisi API
-- rollerinden (anon/authenticated) tamamen geri alınır (aşağıdaki revoke).
-- Admin promosyonu zaten SQL editor'dan (postgres rolü) yapılır, etkilenmez.
drop policy if exists "profiles_update_self" on public.profiles;
create policy "profiles_update_self" on public.profiles
  for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Column-level hardening: API rolleri 'role' sütununu hiçbir koşulda
-- güncelleyemez. Defense-in-depth — RLS politikasına güvenmez.
revoke update (role) on table public.profiles from anon, authenticated;

-- events ----------------------------------------------------------------------
-- approved → herkes okur (anonim dahil); pending/rejected → sahibi + admin.
drop policy if exists "events_select" on public.events;
create policy "events_select" on public.events
  for select using (
    status = 'approved'
    or auth.uid() = created_by
    or public.is_admin()
  );

-- Yeni etkinlik mecburen pending olarak doğar.
drop policy if exists "events_insert" on public.events;
create policy "events_insert" on public.events
  for insert with check (
    auth.uid() = created_by
    and status = 'pending'
  );

-- Owner ve admin update edebilir; field-level koruma trigger'da.
drop policy if exists "events_update" on public.events;
create policy "events_update" on public.events
  for update using (
    auth.uid() = created_by or public.is_admin()
  );

drop policy if exists "events_delete" on public.events;
create policy "events_delete" on public.events
  for delete using (
    auth.uid() = created_by or public.is_admin()
  );

-- event_attendees -------------------------------------------------------------
-- Katılım listesi gizli: kullanıcı sadece KENDİ katılım satırlarını okur
-- (isJoined ve "katıldıklarım" için yeterli). Anonim ziyaretçiye gösterilen
-- sayaç ise aşağıdaki attendee_count() RPC'sinden gelir — böylece kimin
-- katıldığı (user_id listesi) public olarak sızmaz.
drop policy if exists "attendees_select_public" on public.event_attendees;
drop policy if exists "attendees_select_self" on public.event_attendees;
create policy "attendees_select_self" on public.event_attendees
  for select using (auth.uid() = user_id);

-- Public katılımcı sayısı — RLS'i bypass eden security definer fonksiyon.
-- Sadece toplam sayıyı döndürür, satırları/user_id'leri değil.
create or replace function public.attendee_count(p_event_id uuid)
returns integer
language sql
stable
security definer
set search_path = public
as $$
  select count(*)::int
  from public.event_attendees
  where event_id = p_event_id;
$$;

revoke all on function public.attendee_count(uuid) from public;
grant execute on function public.attendee_count(uuid) to anon, authenticated;

drop policy if exists "attendees_insert_self" on public.event_attendees;
create policy "attendees_insert_self" on public.event_attendees
  for insert with check (auth.uid() = user_id);

drop policy if exists "attendees_delete_self" on public.event_attendees;
create policy "attendees_delete_self" on public.event_attendees
  for delete using (auth.uid() = user_id);

-- favorites -------------------------------------------------------------------
drop policy if exists "favorites_select_self" on public.favorites;
create policy "favorites_select_self" on public.favorites
  for select using (auth.uid() = user_id);

drop policy if exists "favorites_insert_self" on public.favorites;
create policy "favorites_insert_self" on public.favorites
  for insert with check (auth.uid() = user_id);

drop policy if exists "favorites_delete_self" on public.favorites;
create policy "favorites_delete_self" on public.favorites
  for delete using (auth.uid() = user_id);

-- =============================================================================
-- REALTIME
-- =============================================================================

-- AuthContext, profiles tablosunda kendi satırını dinler — admin promote
-- edildiğinde Navbar/AdminRoute canlı olarak güncellensin diye.
-- Idempotent: tablo zaten publication üyesiyse tekrar eklemeye çalışma
-- (aksi halde "already member of publication" hatası tüm transaction'ı geri alır).
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'profiles'
  ) then
    alter publication supabase_realtime add table public.profiles;
  end if;
end $$;

-- =============================================================================
-- STORAGE
-- =============================================================================

-- Bucket'ı bu SQL'le yaratıyoruz; Dashboard'da elle de yaratabilirsin.
-- public = true → herkes URL üzerinden okuyabilir.
insert into storage.buckets (id, name, public)
values ('event-images', 'event-images', true)
on conflict (id) do update set public = excluded.public;

-- Bucket politikaları: herkes okur, sahibi kendi UID klasörüne yazar/siler.
drop policy if exists "event_images_select" on storage.objects;
create policy "event_images_select" on storage.objects
  for select using (bucket_id = 'event-images');

drop policy if exists "event_images_insert" on storage.objects;
create policy "event_images_insert" on storage.objects
  for insert with check (
    bucket_id = 'event-images'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "event_images_update" on storage.objects;
create policy "event_images_update" on storage.objects
  for update using (
    bucket_id = 'event-images'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "event_images_delete" on storage.objects;
create policy "event_images_delete" on storage.objects
  for delete using (
    bucket_id = 'event-images'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
