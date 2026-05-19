import { EventMap } from "@features/events";
import { usePageTitle } from "@hooks/usePageTitle";

export default function MapPage() {
  usePageTitle("Harita");

  return (
    <div className="space-y-8">
      <div className="border-b border-zinc-200 pb-8">
        <div className="mb-2 font-mono text-[11px] uppercase tracking-[0.18em] text-zinc-500">
          ↳ Türkiye geneli
        </div>
        <h1 className="display-tight text-[40px] font-light text-zinc-900">
          Harita<span className="text-zinc-400">.</span>
        </h1>
        <p className="mt-2 text-[14px] text-zinc-500">
          Koordinatı olan yüz yüze etkinlikler haritada görünür.
        </p>
      </div>
      <EventMap />
    </div>
  );
}
