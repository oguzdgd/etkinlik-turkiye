const NOMINATIM = "https://nominatim.openstreetmap.org/search";

// Returns { lat, lng } or null if nothing found / request fails.
// Combines locationText + city + "Türkiye" for best accuracy.
export async function geocodeAddress({ city, locationText } = {}) {
  const q = [locationText, city, "Türkiye"].filter(Boolean).join(", ");
  if (!q.trim()) return null;

  const url = new URL(NOMINATIM);
  url.searchParams.set("q", q);
  url.searchParams.set("format", "json");
  url.searchParams.set("limit", "1");

  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "EtkinlikTurkiye/1.0" },
    });
    if (!res.ok) {
      console.warn(`[geocode] Nominatim ${res.status} for q="${q}"`);
      return null;
    }

    const [result] = await res.json();
    if (!result) {
      console.warn(`[geocode] No results for q="${q}"`);
      return null;
    }

    return { lat: parseFloat(result.lat), lng: parseFloat(result.lon) };
  } catch (err) {
    console.warn("[geocode] fetch failed:", err);
    return null;
  }
}
