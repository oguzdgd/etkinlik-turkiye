import { useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { EventList, EventFilters, useEventStats } from "@features/events";
import { useDebounce } from "@hooks/useDebounce";
import { usePageMeta } from "@hooks/usePageMeta";
import { EVENT_CATEGORIES, CITIES } from "@lib/constants";

function dateRangeToISO(range) {
  const now = new Date();
  const todayStart = new Date(now.toISOString().slice(0, 10));
  if (range === "today") {
    const end = new Date(todayStart);
    end.setHours(23, 59, 59, 999);
    return { dateFrom: todayStart.toISOString(), dateTo: end.toISOString() };
  }
  if (range === "week") {
    const end = new Date(todayStart);
    end.setDate(end.getDate() + 6);
    end.setHours(23, 59, 59, 999);
    return { dateFrom: todayStart.toISOString(), dateTo: end.toISOString() };
  }
  if (range === "month") {
    const end = new Date(todayStart.getFullYear(), todayStart.getMonth() + 1, 0, 23, 59, 59, 999);
    return { dateFrom: todayStart.toISOString(), dateTo: end.toISOString() };
  }
  return {};
}

export default function HomePage() {
  usePageMeta({ description: "Türkiye'deki hackathon, workshop ve networking etkinliklerini keşfet. Geliştiriciler için tek platform." });
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState("");
  const [type, setType] = useState(searchParams.get("type") === "online" ? "online" : "all");
  const [city, setCity] = useState(searchParams.get("city") || "");
  const [category, setCategory] = useState(searchParams.get("category") || "");
  const [dateRange, setDateRange] = useState("all");
  const [sortBy, setSortBy] = useState("date_asc");

  const rawFilters = useMemo(() => {
    const dateISO = dateRangeToISO(dateRange);
    return { search, type, city, category, sortBy, ...dateISO };
  }, [search, type, city, category, dateRange, sortBy]);
  const debouncedFilters = useDebounce(rawFilters, 300);
  const { data: stats } = useEventStats();

  return (
    <div className="space-y-6">
      {/* Compact hero banner */}
      <section className="hero-full-bleed stripe-placeholder-dark relative -mt-8 overflow-hidden bg-black text-white">
        <div className="relative px-8 py-8 md:px-14 md:py-10">
          {/* Meta row */}
          <div className="mb-3 flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.18em] text-zinc-400">
            <span className="inline-flex items-center gap-2">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inset-0 animate-ping rounded-full bg-white opacity-60" />
                <span className="relative h-1.5 w-1.5 rounded-full bg-white" />
              </span>
              Canlı
            </span>
            <span className="text-zinc-700">/</span>
            <span>Türkiye'nin etkinlik platformu</span>
          </div>

          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="display-tight text-[40px] font-light leading-[0.92] md:text-[56px]">
                Etkinlikleri <span className="font-semibold">Keşfet</span><span className="text-zinc-600">.</span>
              </h1>
              <p className="mt-2 text-[13.5px] leading-relaxed text-zinc-400">
                Hackathon'lar, workshop'lar, networking — geliştiriciler için.
              </p>
            </div>

            <div className="flex items-end gap-6 border-t border-zinc-800 pt-5 md:border-0 md:pt-0">
              <Stat n={stats?.eventCount ?? "—"} label="Etkinlik" />
              <Stat n={EVENT_CATEGORIES.length} label="Kategori" />
              <Stat n={CITIES.filter((c) => c.slug !== "online").length} label="İl" />
            </div>
          </div>
        </div>
      </section>

      <EventFilters
        search={search}
        onSearchChange={setSearch}
        type={type}
        onTypeChange={setType}
        city={city}
        onCityChange={setCity}
        category={category}
        onCategoryChange={setCategory}
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
        sortBy={sortBy}
        onSortByChange={setSortBy}
      />

      <EventList filters={debouncedFilters} pageSize={12} />
    </div>
  );
}

function Stat({ n, label }) {
  return (
    <div>
      <div className="display-tight tabular text-[26px] font-light">{n}</div>
      <div className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">
        {label}
      </div>
    </div>
  );
}
