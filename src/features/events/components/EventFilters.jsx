import { EVENT_TYPE, EVENT_CATEGORIES } from "@lib/constants";

const TYPE_OPTIONS = [
  { value: "all", label: "Hepsi" },
  { value: EVENT_TYPE.ONLINE, label: "Online" },
  { value: EVENT_TYPE.IN_PERSON, label: "Yüz Yüze" },
];

export default function EventFilters({
  search,
  onSearchChange,
  type,
  onTypeChange,
  city,
  onCityChange,
  category,
  onCategoryChange,
}) {
  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-3 sm:flex-row">
        {/* Search */}
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
            onChange={(e) => onSearchChange(e.target.value)}
            className="focus-ring h-11 w-full rounded-xl border border-zinc-200 bg-white pl-10 pr-4 text-[13.5px] text-zinc-900 placeholder:text-zinc-400 transition-colors hover:border-zinc-300 focus:border-zinc-900 focus:outline-none"
          />
        </div>

        {/* City */}
        <div className="relative sm:w-44">
          <svg
            className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400"
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}
          >
            <path d="M12 21s-7-6.2-7-12a7 7 0 0 1 14 0c0 5.8-7 12-7 12Z" />
            <circle cx="12" cy="9" r="2.5" />
          </svg>
          <input
            type="text"
            placeholder="Şehir"
            value={city}
            onChange={(e) => onCityChange(e.target.value)}
            className="focus-ring h-11 w-full rounded-xl border border-zinc-200 bg-white pl-10 pr-4 text-[13.5px] text-zinc-900 placeholder:text-zinc-400 transition-colors hover:border-zinc-300 focus:border-zinc-900 focus:outline-none"
          />
        </div>

        {/* Category */}
        <select
          value={category}
          onChange={(e) => onCategoryChange(e.target.value)}
          className="focus-ring h-11 w-full rounded-xl border border-zinc-200 bg-white px-3.5 text-[13.5px] text-zinc-700 transition-colors hover:border-zinc-300 focus:border-zinc-900 focus:outline-none sm:w-48"
        >
          <option value="">Tüm kategoriler</option>
          {EVENT_CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      {/* Type pills */}
      <div className="flex items-center gap-2">
        {TYPE_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onTypeChange(opt.value)}
            className={`focus-ring inline-flex h-9 items-center rounded-full px-4 text-[12.5px] font-medium transition-colors
              ${type === opt.value
                ? "border border-black bg-black text-white"
                : "border border-zinc-200 bg-white text-zinc-600 hover:border-zinc-400 hover:text-zinc-900"
              }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}
