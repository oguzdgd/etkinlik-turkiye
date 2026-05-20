const dateFormatter = new Intl.DateTimeFormat("tr-TR", {
  day: "numeric",
  month: "long",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

const dayFmt = new Intl.DateTimeFormat("tr-TR", { day: "numeric" });
const monthYearFmt = new Intl.DateTimeFormat("tr-TR", { month: "long", year: "numeric" });
const shortMonthFmt = new Intl.DateTimeFormat("tr-TR", { day: "numeric", month: "short" });
const shortMonthYearFmt = new Intl.DateTimeFormat("tr-TR", { day: "numeric", month: "short", year: "numeric" });

// Accepts a Firestore Timestamp, JS Date, or ISO string.
export function formatEventDate(value) {
  if (!value) return "";
  const date = typeof value?.toDate === "function" ? value.toDate() : new Date(value);
  return dateFormatter.format(date);
}

// Returns a compact range string for multi-day events.
// If endsAt is null/undefined, falls back to formatEventDate(startsAt).
export function formatEventDateRange(startsAt, endsAt) {
  if (!endsAt) return formatEventDate(startsAt);
  const start = new Date(startsAt);
  const end = new Date(endsAt);
  if (start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear()) {
    return `${dayFmt.format(start)}–${dayFmt.format(end)} ${monthYearFmt.format(end)}`;
  }
  return `${shortMonthFmt.format(start)} – ${shortMonthYearFmt.format(end)}`;
}
