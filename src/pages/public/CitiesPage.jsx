import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { CITIES } from "@lib/constants";
import { usePageTitle } from "@hooks/usePageTitle";

const SORTED_CITIES = [...CITIES].sort((a, b) => {
  if (a.slug === "online") return -1;
  if (b.slug === "online") return 1;
  return a.name.localeCompare(b.name, "tr");
});

const IL_COUNT = CITIES.filter((c) => c.slug !== "online").length;

export default function CitiesPage() {
  usePageTitle("Şehirler");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return SORTED_CITIES;
    return SORTED_CITIES.filter((c) => c.name.toLowerCase().includes(q));
  }, [search]);

  return (
    <>
      <div className="mb-4">
        <div className="mb-1 font-mono text-[11px] uppercase tracking-[0.18em] text-zinc-400">↳ Türkiye'de</div>
        <h1 className="display-tight text-[30px] font-normal tracking-tight text-zinc-900">Şehirler</h1>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-sm">
          <svg
            className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400"
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}
          >
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>
          <input
            type="text"
            placeholder="Şehir ara…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="focus-ring h-11 w-full rounded-xl border border-zinc-200 bg-white pl-10 pr-4 text-[13.5px] placeholder:text-zinc-400 transition-colors hover:border-zinc-300 focus:border-zinc-900 focus:outline-none"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="text-[14px] text-zinc-500">"{search}" için sonuç bulunamadı.</p>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {filtered.map((city) => (
            <Link
              key={city.slug}
              to={`/cities/${city.slug}`}
              className="group flex flex-col rounded-xl border border-zinc-200 bg-white p-4 transition-colors hover:border-zinc-400 hover:bg-zinc-50 focus-ring"
            >
              <span className="text-[15px] font-normal tracking-tight text-zinc-900">
                {city.name}
              </span>
              <span className="mt-0.5 text-[12px] text-zinc-400">
                {city.region}
              </span>
              <svg
                className="mt-3 h-3.5 w-3.5 text-zinc-300 transition-colors group-hover:text-zinc-900"
                fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
