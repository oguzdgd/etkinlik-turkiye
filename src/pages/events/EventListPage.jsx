import { EventList } from "@features/events";

export default function EventListPage() {
  return (
    <section className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">Etkinlikler</h1>
        <p className="text-sm text-gray-600">Yakındaki etkinlikleri keşfet.</p>
      </header>
      <EventList pageSize={12} />
    </section>
  );
}
