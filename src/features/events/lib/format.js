const dateTimeFormatter = new Intl.DateTimeFormat("tr-TR", {
  day: "numeric",
  month: "long",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

const dateOnlyFormatter = new Intl.DateTimeFormat("tr-TR", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

const dayFmt = new Intl.DateTimeFormat("tr-TR", { day: "numeric" });
const monthYearFmt = new Intl.DateTimeFormat("tr-TR", { month: "long", year: "numeric" });
const shortMonthFmt = new Intl.DateTimeFormat("tr-TR", { day: "numeric", month: "short" });
const shortMonthYearFmt = new Intl.DateTimeFormat("tr-TR", { day: "numeric", month: "short", year: "numeric" });

export function formatEventDate(value, { timeTbd = false } = {}) {
  if (!value) return "";
  const date = typeof value?.toDate === "function" ? value.toDate() : new Date(value);
  return timeTbd ? dateOnlyFormatter.format(date) : dateTimeFormatter.format(date);
}

export function formatDateOnly(value) {
  if (!value) return "";
  return dateOnlyFormatter.format(new Date(value));
}

export function formatDeadlineDate(value) {
  if (!value) return "";
  return dateOnlyFormatter.format(new Date(value));
}

// Determines whether an event is fully in the past.
// Priority: application_deadline → ends_at → starts_at
export function isPast(event) {
  const ref = event.applicationDeadline ?? event.endsAt ?? event.startsAt;
  if (!ref) return false;
  return new Date(ref) < new Date();
}

// Returns a compact range string for multi-day events.
// If endsAt is null/undefined, falls back to formatEventDate(startsAt).
export function formatEventDateRange(startsAt, endsAt, { timeTbd = false } = {}) {
  if (!endsAt) return formatEventDate(startsAt, { timeTbd });
  const start = new Date(startsAt);
  const end = new Date(endsAt);
  if (start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear()) {
    return `${dayFmt.format(start)}–${dayFmt.format(end)} ${monthYearFmt.format(end)}`;
  }
  return `${shortMonthFmt.format(start)} – ${shortMonthYearFmt.format(end)}`;
}
