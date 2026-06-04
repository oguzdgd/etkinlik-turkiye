import { EventList } from "@features/events";

export default function EventListPage() {
  return (
    <section className="space-y-6">
      <div className="mb-4">
        <div className="mb-1 font-mono text-[11px] uppercase tracking-[0.18em] text-zinc-400">↳ Yazılım & Teknoloji</div>
        <h1 className="display-tight text-[30px] font-normal tracking-tight text-zinc-900">Keşfet</h1>
      </div>
      <EventList pageSize={12} />
    </section>
  );
}
