import { useState } from "react";
import { EventList, EventFilters } from "@features/events";
import { useDebounce } from "@hooks/useDebounce";

export default function HomePage() {
  const [search, setSearch] = useState("");
  const [type, setType] = useState("all");
  const [city, setCity] = useState("");
  const [category, setCategory] = useState("");

  const debouncedFilters = useDebounce({ search, type, city, category }, 300);

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Etkinlik Türkiye</h1>
        <p className="mt-1 text-gray-500">Yakındaki etkinlikleri keşfet.</p>
      </div>

      <EventFilters
        search={search}
        onSearchChange={setSearch}
        type={type}
        onTypeChange={setType}
        city={city}
        onCityChange={setCity}
        category={category}
        onCategoryChange={setCategory}
      />

      <EventList filters={debouncedFilters} pageSize={12} />
    </section>
  );
}
