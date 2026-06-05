import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth, useUserStats, useRecentUsers, useTopCreators } from "@features/auth";
import {
  useEventStats,
  useAdminStats,
  usePendingEvents,
  PendingEventList,
} from "@features/events";
import { usePageTitle } from "@hooks/usePageTitle";

const NAV = [
  { id: "dashboard",  label: "Gösterge paneli" },
  { id: "events",     label: "Etkinlikler" },
  { id: "users",      label: "Kullanıcılar" },
  { id: "settings",   label: "Ayarlar" },
];

export default function AdminDashboardPage() {
  usePageTitle("Admin Paneli");
  const [section, setSection] = useState("dashboard");
  const { user } = useAuth();
  const { data: stats } = useEventStats();
  const { data: adminStats } = useAdminStats();
  const { data: pendingEvents = [] } = usePendingEvents();

  const initials = user?.displayName
    ? user.displayName.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()
    : (user?.email ?? "—").slice(0, 2).toUpperCase();

  const SECTION_LABEL = { dashboard: "Gösterge paneli", events: "Etkinlikler", users: "Kullanıcılar", settings: "Ayarlar" };

  return (
    <div
      className="min-h-screen bg-zinc-50"
      style={{ display: "grid", gridTemplateColumns: "260px 1fr" }}
    >
      {/* ── Sidebar ── */}
      <aside className="bg-zinc-950 text-zinc-300 flex flex-col sticky top-0 h-screen overflow-y-auto">
        <div className="px-5 py-5 border-b border-zinc-800 flex items-center gap-2.5 shrink-0">
          <Link
            to="/"
            className="grid place-items-center w-7 h-7 rounded-md bg-white text-black font-mono text-[11px] font-medium shrink-0"
          >
            ET
          </Link>
          <div className="min-w-0">
            <div className="text-[13px] font-medium text-white tracking-tight truncate">Etkinlik TR</div>
            <div className="font-mono text-[10px] tracking-[0.18em] uppercase text-zinc-500">Admin</div>
          </div>
        </div>

        <nav className="p-3 flex-1">
          {NAV.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setSection(id)}
              className={`w-full text-left px-3 py-2 rounded-md text-[13px] mb-0.5 transition-colors
                ${section === id
                  ? "bg-zinc-800 text-white"
                  : "text-zinc-400 hover:bg-zinc-900 hover:text-white"}`}
            >
              {label}
              {id === "events" && pendingEvents.length > 0 && (
                <span className="ml-2 inline-flex items-center justify-center w-5 h-5 rounded-full bg-white text-zinc-900 font-mono text-[10px]">
                  {pendingEvents.length}
                </span>
              )}
            </button>
          ))}
        </nav>

        <div className="p-3 border-t border-zinc-800 shrink-0">
          <Link
            to="/"
            className="flex w-full text-left px-3 py-2 rounded-md text-[13px] text-zinc-400 hover:bg-zinc-900 hover:text-white transition-colors"
          >
            ← Siteye dön
          </Link>
        </div>
      </aside>

      {/* ── Main ── */}
      <div>
        {/* Topbar */}
        <header className="bg-white border-b border-zinc-200 h-16 px-8 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <span className="font-mono text-[11px] tracking-[0.18em] uppercase text-zinc-500">Admin</span>
            <span className="text-zinc-300">/</span>
            <span className="text-[15px] font-medium tracking-tight text-zinc-900">
              {SECTION_LABEL[section]}
            </span>
          </div>
          <div className="flex items-center gap-3">
            {pendingEvents.length > 0 && (
              <button
                onClick={() => setSection("events")}
                className="hidden sm:inline-flex items-center gap-1.5 h-8 px-3 rounded-full bg-zinc-900 text-white text-[12px] font-medium hover:bg-zinc-700 transition-colors"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
                {pendingEvents.length} bekleyen
              </button>
            )}
            <span className="grid place-items-center w-8 h-8 rounded-full bg-zinc-900 text-white font-mono text-[10.5px]">
              {initials}
            </span>
          </div>
        </header>

        <div className="p-8 max-w-[1400px] w-full">
          {section === "dashboard" && (
            <DashboardSection
              stats={stats}
              adminStats={adminStats}
              pendingEvents={pendingEvents}
              onGoEvents={() => setSection("events")}
            />
          )}
          {section === "events" && <EventsSection />}
          {section === "users" && <UsersSection />}
          {section === "settings" && <SettingsSection />}
        </div>
      </div>
    </div>
  );
}

/* ── Gösterge Paneli ── */

function DashboardSection({ adminStats, pendingEvents, onGoEvents }) {
  const s = adminStats;
  const pending = pendingEvents.length;

  return (
    <>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <KPI label="Toplam"     value={s?.total    ?? "—"} sub="Tüm etkinlikler" />
        <KPI label="Yayında"    value={s?.approved ?? "—"} sub="Onaylanmış" />
        <KPI label="Bekleyen"   value={s?.pending  ?? "—"} sub="Moderasyon kuyruğu" highlight={(s?.pending ?? 0) > 0} />
        <KPI label="Reddedilen" value={s?.rejected ?? "—"} sub="Onaylanmamış" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sparkline */}
        <div className="lg:col-span-2 bg-white border border-zinc-200 rounded-2xl p-6">
          <div className="flex items-baseline justify-between mb-5">
            <h3 className="text-[15px] font-medium text-zinc-900">Haftalık katılım</h3>
            <span className="font-mono text-[11px] tracking-[0.16em] uppercase text-zinc-500">son 8 hafta</span>
          </div>
          <SparkChart />
        </div>

        {/* Pending preview */}
        <div className="bg-white border border-zinc-200 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[15px] font-medium text-zinc-900">Moderasyon kuyruğu</h3>
            {pending > 0 && (
              <button
                onClick={onGoEvents}
                className="font-mono text-[11px] tracking-[0.14em] uppercase text-zinc-500 hover:text-zinc-900 transition-colors"
              >
                Tümü →
              </button>
            )}
          </div>

          {pending === 0 ? (
            <div className="py-8 text-center font-mono text-[11px] tracking-[0.18em] uppercase text-zinc-400">
              Kuyruk boş
            </div>
          ) : (
            <ul className="space-y-3">
              {pendingEvents.slice(0, 5).map((e) => (
                <li key={e.id} className="flex items-start gap-3">
                  <span className="grid place-items-center w-7 h-7 rounded-md bg-zinc-100 text-zinc-600 font-mono text-[9.5px] shrink-0 mt-0.5">
                    {(e.category ?? "—").slice(0, 2).toUpperCase()}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="text-[13px] text-zinc-900 truncate">{e.title}</div>
                    <div className="font-mono text-[10.5px] tracking-[0.14em] uppercase text-zinc-400 mt-0.5">
                      {e.city || "Online"}
                    </div>
                  </div>
                </li>
              ))}
              {pending > 5 && (
                <li className="pt-1 text-center font-mono text-[10.5px] tracking-[0.14em] uppercase text-zinc-400">
                  +{pending - 5} daha
                </li>
              )}
            </ul>
          )}
        </div>
      </div>
    </>
  );
}

/* ── Etkinlikler (moderation queue) ── */

function EventsSection() {
  return (
    <div>
      <div className="mb-6">
        <div className="font-mono text-[11px] tracking-[0.18em] uppercase text-zinc-500 mb-1">
          Moderasyon kuyruğu
        </div>
        <h2 className="text-[22px] font-light tracking-tight text-zinc-900">
          Onay Bekleyenler
        </h2>
      </div>

      {/* Criteria callout */}
      <div className="mb-6 bg-white rounded-xl border border-zinc-200 px-5 py-4">
        <div className="mb-2 font-mono text-[10.5px] uppercase tracking-[0.18em] text-zinc-500">
          Kabul kriterleri
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[12.5px] text-zinc-600">
          <div className="flex items-start gap-2">
            <span className="text-zinc-400 mt-0.5 shrink-0">✓</span>
            <span>Hackathon · konferans · meetup · workshop · bootcamp · staj · yarışma · AI etkinlikleri</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-zinc-400 mt-0.5 shrink-0">✗</span>
            <span>Yazılım/teknoloji odağı olmayan etkinlikler, konser, spor, genel kültür eğitimleri</span>
          </div>
        </div>
      </div>

      <PendingEventList />
    </div>
  );
}

/* ── Kullanıcılar ── */

function UsersSection() {
  const { data: stats } = useUserStats();
  const { data: recent = [] } = useRecentUsers();
  const { data: creators = [] } = useTopCreators();

  return (
    <>
      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <KPI label="Toplam kullanıcı"    value={stats?.total     ?? "—"} sub="Kayıtlı hesap" />
        <KPI label="Bu ay yeni"          value={stats?.thisMonth ?? "—"} sub="Bu ay katılanlar" />
        <KPI label="Etkinlik oluşturan"  value={stats?.creators  ?? "—"} sub="En az 1 etkinlik" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Son kayıt olanlar */}
        <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-zinc-100">
            <h3 className="text-[14px] font-medium text-zinc-900">Son kayıt olanlar</h3>
          </div>
          <ul className="divide-y divide-zinc-100">
            {recent.length === 0 ? (
              <li className="px-6 py-8 text-center font-mono text-[11px] uppercase tracking-[0.18em] text-zinc-400">Veri yok</li>
            ) : recent.map((u) => (
              <li key={u.id} className="flex items-center gap-3 px-6 py-3">
                <span className="grid place-items-center w-8 h-8 rounded-full bg-zinc-100 text-zinc-700 font-mono text-[11px] shrink-0">
                  {(u.display_name || u.email || "?").slice(0, 2).toUpperCase()}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="text-[13px] font-medium text-zinc-900 truncate">
                    {u.display_name || <span className="text-zinc-400">—</span>}
                  </div>
                  <div className="text-[12px] text-zinc-500 truncate">{u.email}</div>
                </div>
                <div className="text-right shrink-0">
                  {u.role === "admin" && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-zinc-900 text-white font-mono text-[9.5px] uppercase tracking-[0.14em] mb-1">
                      admin
                    </span>
                  )}
                  <div className="font-mono text-[10.5px] text-zinc-400">
                    {new Date(u.created_at).toLocaleDateString("tr-TR", { day: "numeric", month: "short" })}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Top oluşturucular */}
        <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-zinc-100">
            <h3 className="text-[14px] font-medium text-zinc-900">En çok etkinlik oluşturanlar</h3>
          </div>
          <ul className="divide-y divide-zinc-100">
            {creators.length === 0 ? (
              <li className="px-6 py-8 text-center font-mono text-[11px] uppercase tracking-[0.18em] text-zinc-400">Veri yok</li>
            ) : creators.map((c, i) => (
              <li key={c.id} className="flex items-center gap-3 px-6 py-3">
                <span className="tabular font-mono text-[11px] text-zinc-400 w-5 shrink-0">{i + 1}</span>
                <span className="grid place-items-center w-8 h-8 rounded-full bg-zinc-100 text-zinc-700 font-mono text-[11px] shrink-0">
                  {(c.display_name || c.email || "?").slice(0, 2).toUpperCase()}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="text-[13px] font-medium text-zinc-900 truncate">
                    {c.display_name || <span className="text-zinc-400">—</span>}
                  </div>
                  <div className="text-[12px] text-zinc-500 truncate">{c.email}</div>
                </div>
                <div className="tabular font-mono text-[13px] font-medium text-zinc-900 shrink-0">
                  {c.count}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
}

/* ── Ayarlar ── */

function SettingsSection() {
  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <div className="font-mono text-[11px] tracking-[0.18em] uppercase text-zinc-500 mb-1">Sistem</div>
        <h2 className="text-[22px] font-light tracking-tight text-zinc-900">Ayarlar</h2>
      </div>

      <div className="bg-white border border-zinc-200 rounded-2xl divide-y divide-zinc-100">
        <div className="p-6">
          <div className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-zinc-500 mb-3">
            Moderasyon kriterleri
          </div>
          <p className="text-[13.5px] leading-relaxed text-zinc-600">
            Teknik bir beceri kazandıran veya yazılım/teknoloji kariyerine katkı sağlayan etkinlikler kabul edilir.
          </p>
          <ul className="mt-4 space-y-2 text-[13px] text-zinc-600">
            <li className="flex items-start gap-2">
              <span className="text-zinc-400 mt-0.5 shrink-0">✓</span>
              Hackathon, konferans, meetup, workshop, bootcamp, staj, yarışma, AI etkinlikleri
            </li>
            <li className="flex items-start gap-2">
              <span className="text-zinc-400 mt-0.5 shrink-0">✗</span>
              Finans, pazarlama, genel kültür eğitimleri — yazılım/teknoloji odağı olmayan her şey
            </li>
            <li className="flex items-start gap-2">
              <span className="text-zinc-400 mt-0.5 shrink-0">✗</span>
              Konser, spor, sosyal etkinlikler
            </li>
          </ul>
        </div>

        <div className="p-6">
          <div className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-zinc-500 mb-2">
            Email import pipeline
          </div>
          <p className="text-[13px] leading-relaxed text-zinc-600">
            Gmail OAuth2 → keyword filtresi → Groq Llama 3.3-70b → pending events. Her 6 saatte otomatik çalışır.
          </p>
          <div className="mt-3 inline-flex items-center gap-1.5 font-mono text-[10.5px] tracking-[0.14em] uppercase text-zinc-400">
            <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 inline-block"></span>
            v32 · aktif
          </div>
        </div>

        <div className="p-6">
          <div className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-zinc-500 mb-2">
            Admin yetkisi
          </div>
          <p className="text-[13px] leading-relaxed text-zinc-600">
            Admin yetkilendirmesi Supabase Dashboard → SQL Editor üzerinden yapılır:
          </p>
          <pre className="mt-3 px-4 py-3 rounded-xl bg-zinc-50 border border-zinc-200 font-mono text-[12px] text-zinc-700 overflow-x-auto">
            {`UPDATE profiles SET role = 'admin'\nWHERE email = 'kullanici@example.com';`}
          </pre>
        </div>
      </div>
    </div>
  );
}

/* ── Shared components ── */

function KPI({ label, value, sub, highlight }) {
  return (
    <div className={`bg-white border rounded-2xl p-6 ${highlight ? "border-zinc-900" : "border-zinc-200"}`}>
      <div className="font-mono text-[10.5px] tracking-[0.18em] uppercase text-zinc-500">{label}</div>
      <div
        className="mt-3 font-light text-zinc-900 tabular leading-none"
        style={{ fontSize: "34px", letterSpacing: "-0.04em" }}
      >
        {value}
      </div>
      <div className="mt-2 font-mono text-[10.5px] tracking-[0.14em] uppercase text-zinc-500">{sub}</div>
    </div>
  );
}

function SparkChart() {
  const data = [240, 320, 280, 410, 380, 520, 480, 640];
  const max = Math.max(...data);
  return (
    <div className="flex items-end gap-2 h-40">
      {data.map((v, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-2">
          <div
            className="w-full bg-zinc-900 rounded-t"
            style={{ height: `${(v / max) * 100}%` }}
          />
          <span className="font-mono text-[9.5px] tracking-[0.14em] text-zinc-400">H{i + 1}</span>
        </div>
      ))}
    </div>
  );
}
