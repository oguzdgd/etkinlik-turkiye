import "leaflet/dist/leaflet.css";
import L from "leaflet";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import { useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

const TURKEY_CENTER = [39.0, 35.0];

// Şehir adlarına göre yaklaşık merkez koordinatlar (API çağrısız)
const CITY_CENTERS = {
  istanbul: [41.015, 28.979],
  ankara: [39.925, 32.866],
  izmir: [38.423, 27.143],
  bursa: [40.183, 29.067],
  antalya: [36.897, 30.713],
  eskişehir: [39.776, 30.520],
  eskisehir: [39.776, 30.520],
  adana: [37.000, 35.321],
  konya: [37.871, 32.485],
  kayseri: [38.721, 35.487],
  gaziantep: [37.066, 37.383],
  mersin: [36.801, 34.614],
  diyarbakır: [37.925, 40.218],
  diyarbakir: [37.925, 40.218],
  trabzon: [41.005, 39.723],
  samsun: [41.287, 36.330],
  denizli: [37.774, 29.088],
  kocaeli: [40.856, 29.881],
  manisa: [38.619, 27.426],
  balıkesir: [39.649, 27.889],
  balikesir: [39.649, 27.889],
};

function normCity(city) {
  return city
    .toLowerCase()
    .trim()
    .replace(/İ/g, "i")
    .replace(/ı/g, "i")
    .replace(/ğ/g, "g")
    .replace(/ş/g, "s")
    .replace(/ç/g, "c")
    .replace(/ö/g, "o")
    .replace(/ü/g, "u");
}

function getCityCenter(city) {
  if (!city?.trim()) return null;
  const norm = normCity(city);
  for (const [key, coords] of Object.entries(CITY_CENTERS)) {
    if (normCity(key) === norm) return coords;
  }
  return null;
}

// Haritayı verilen merkeze uçurur (yalnızca marker YOK ve şehir değiştiğinde)
function FlyToCity({ city, hasPin }) {
  const map = useMap();
  const prevCity = useRef("");

  useEffect(() => {
    if (hasPin) return; // pin varsa kullanıcı zaten seçmiş, dokunma
    const center = getCityCenter(city);
    if (center && city !== prevCity.current) {
      map.flyTo(center, 12, { duration: 0.8 });
    }
    prevCity.current = city;
  }, [city, hasPin, map]);

  return null;
}

// Tıklamayı yakalayıp parent'a iletir
function ClickHandler({ onPick }) {
  useMapEvents({
    click(e) {
      onPick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export default function LocationPicker({ lat, lng, city, onChange }) {
  const hasPin = lat != null && lng != null;
  const initialCenter = hasPin ? [lat, lng] : TURKEY_CENTER;
  const initialZoom = hasPin ? 13 : 6;

  return (
    <div className="space-y-2">
      <div className="isolate overflow-hidden rounded-xl border border-zinc-200" style={{ height: 280 }}>
        <MapContainer
          center={initialCenter}
          zoom={initialZoom}
          style={{ height: "100%", width: "100%" }}
          scrollWheelZoom
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          />
          <FlyToCity city={city} hasPin={hasPin} />
          <ClickHandler onPick={onChange} />
          {hasPin && (
            <Marker
              position={[lat, lng]}
              draggable
              eventHandlers={{
                dragend(e) {
                  const { lat: newLat, lng: newLng } = e.target.getLatLng();
                  onChange(newLat, newLng);
                },
              }}
            />
          )}
        </MapContainer>
      </div>

      <div className="flex items-center justify-between">
        {hasPin ? (
          <p className="font-mono text-[11px] text-zinc-500">
            📍 {lat.toFixed(5)}, {lng.toFixed(5)}
            <span className="ml-2 text-zinc-400">— sürükleyerek ayarlayabilirsin</span>
          </p>
        ) : (
          <p className="font-mono text-[11px] text-zinc-400">
            Haritaya tıkla → konum sabitle
          </p>
        )}
        {hasPin && (
          <button
            type="button"
            onClick={() => onChange(null, null)}
            className="text-[11px] text-zinc-400 underline hover:text-zinc-700"
          >
            Temizle
          </button>
        )}
      </div>
    </div>
  );
}
