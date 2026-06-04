import { EventMap } from "@features/events";
import { usePageTitle } from "@hooks/usePageTitle";

export default function MapPage() {
  usePageTitle("Harita");

  return (
    <div className="space-y-6">
      <div className="mb-4">
        <div className="mb-1 font-mono text-[11px] uppercase tracking-[0.18em] text-zinc-400">↳ Türkiye geneli</div>
        <h1 className="display-tight text-[30px] font-normal tracking-tight text-zinc-900">Harita</h1>
      </div>
      <EventMap />
    </div>
  );
}
