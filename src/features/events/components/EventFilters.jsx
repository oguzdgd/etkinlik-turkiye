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
        <input
          type="text"
          placeholder="Etkinlik ara..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm placeholder-gray-400 focus:border-gray-500 focus:outline-none"
        />
        <input
          type="text"
          placeholder="Şehir"
          value={city}
          onChange={(e) => onCityChange(e.target.value)}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm placeholder-gray-400 focus:border-gray-500 focus:outline-none sm:w-40"
        />
        <select
          value={category}
          onChange={(e) => onCategoryChange(e.target.value)}
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-700 focus:border-gray-500 focus:outline-none sm:w-44"
        >
          <option value="">Tüm kategoriler</option>
          {EVENT_CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      <div className="flex gap-2">
        {TYPE_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onTypeChange(opt.value)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition ${
              type === opt.value
                ? "bg-gray-900 text-white"
                : "border border-gray-300 text-gray-600 hover:border-gray-400"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}
