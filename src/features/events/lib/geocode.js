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
    if (!res.ok) return null;

    const [result] = await res.json();
    if (!result) return null;

    return { lat: parseFloat(result.lat), lng: parseFloat(result.lon) };
  } catch {
    return null;
  }
}
