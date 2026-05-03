import { EventMap } from "@features/events";

export default function MapPage() {
  return (
    <div className="space-y-5">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">Harita</h1>
        <p className="text-sm text-gray-600">
          Koordinatı olan yüz yüze etkinlikler haritada görünür.
        </p>
      </header>
      <EventMap />
    </div>
  );
}
