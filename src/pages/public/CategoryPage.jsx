import { useState, useMemo } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { EventList } from "@features/events";
import { usePageMeta } from "@hooks/usePageMeta";
import { useDebounce } from "@hooks/useDebounce";
import { CATEGORY_DESCRIPTIONS, categoryFromSlug } from "@lib/constants";

const SORT_OPTIONS = [
  { value: "date_asc", label: "Yaklaşan" },
  { value: "date_desc", label: "En Uzak" },
  { value: "newest", label: "En Yeni" },
];

export default function CategoryPage() {
  const { slug } = useParams();
  const category = categoryFromSlug(slug);

  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("date_asc");

  usePageMeta({
    title: category ? `${category} Etkinlikleri` : "Kategori",
    description: category ? CATEGORY_DESCRIPTIONS[category] : undefined,
  });

  const rawFilters = useMemo(
    () => ({ search, category: category ?? "", sortBy }),
    [search, category, sortBy]
  );
  const filters = useDebounce(rawFilters, 300);

  if (!category) return <Navigate to="/categories" replace />;

  return (
    <div className="space-y-6">
      <div className="border-b border-zinc-200 pb-5">
        <Link
          to="/categories"
          className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.14em] text-zinc-500 hover:text-zinc-900"
        >
          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Kategoriler
        </Link>
        <h1 className="display-tight mt-2 text-[30px] font-light leading-tight text-zinc-900 md:text-[38px]">
          {category}<span className="text-zinc-400">.</span>
        </h1>
        <p className="mt-1.5 max-w-2xl text-[13.5px] leading-relaxed text-zinc-500">
          {CATEGORY_DESCRIPTIONS[category]}
        </p>
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1">
          <svg
            className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400"
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}
          >
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>
          <input
            type="text"
            placeholder="Etkinlik ara…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="focus-ring h-11 w-full rounded-xl border border-zinc-200 bg-white pl-10 pr-4 text-[13.5px] placeholder:text-zinc-400 transition-colors hover:border-zinc-300 focus:border-zinc-900 focus:outline-none"
          />
        </div>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="focus-ring h-11 rounded-xl border border-zinc-200 bg-white px-3.5 text-[13.5px] text-zinc-600 hover:border-zinc-300 focus:border-zinc-900 focus:outline-none"
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      <EventList filters={filters} pageSize={12} />
    </div>
  );
}
