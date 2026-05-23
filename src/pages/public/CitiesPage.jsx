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
      {/* Page header */}
      <div className="mb-6 border-b border-zinc-200 pb-6">
        <div className="mb-2 font-mono text-[11px] uppercase tracking-[0.18em] text-zinc-500">
          ↳ Türkiye'de
        </div>
        <div className="grid grid-cols-12 items-end gap-4">
          <h1 className="display-tight col-span-12 text-[40px] font-light leading-[0.92] text-zinc-900 md:col-span-8 md:text-[52px]">
            Şehirler<span className="text-zinc-400">.</span>
          </h1>
          <div className="col-span-12 md:col-span-4 md:justify-self-end">
            <div className="tabular display-tight text-[32px] font-light text-zinc-900">
              {IL_COUNT}
            </div>
            <div className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-zinc-500">
              il · Online
            </div>
          </div>
        </div>
        <p className="mt-4 max-w-2xl text-[14px] leading-relaxed text-zinc-600">
          Yaşadığınız şehirdeki yazılım etkinliklerini keşfedin — hackathon, workshop,
          meetup ve konferanslar.
        </p>

        {/* Search */}
        <div className="relative mt-8 max-w-sm">
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
              <span className="text-[15px] font-medium tracking-tight text-zinc-900">
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
