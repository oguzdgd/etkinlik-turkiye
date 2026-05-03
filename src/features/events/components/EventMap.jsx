import "leaflet/dist/leaflet.css";
import L from "leaflet";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { Link } from "react-router-dom";
import { useEventsForMap } from "../hooks/useEventsForMap";
import Spinner from "@components/ui/Spinner";

// Vite's asset pipeline breaks Leaflet's default icon URL resolution.
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

const TURKEY_CENTER = [39.0, 35.0];

export default function EventMap() {
  const { data: events = [], isLoading, isError } = useEventsForMap();

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex h-96 items-center justify-center text-sm text-red-600">
        Harita yüklenemedi.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200">
      <MapContainer
        center={TURKEY_CENTER}
        zoom={6}
        style={{ height: "560px", width: "100%" }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> katkıcıları'
        />
        {events.map((event) => (
          <Marker key={event.id} position={[event.lat, event.lng]}>
            <Popup>
              <div className="space-y-1">
                <p className="font-semibold">{event.title}</p>
                <p className="text-xs text-gray-500">
                  {new Date(event.startsAt).toLocaleDateString("tr-TR", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
                <Link
                  to={`/events/${event.id}`}
                  className="text-xs text-blue-600 hover:underline"
                >
                  Detaya git →
                </Link>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      {events.length === 0 && (
        <p className="py-3 text-center text-sm text-gray-500">
          Haritada gösterilecek etkinlik yok.
        </p>
      )}
    </div>
  );
}
