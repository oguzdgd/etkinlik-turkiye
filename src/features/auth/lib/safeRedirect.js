// Same-origin redirect guard — prevents `?from=//evil.com` open-redirect.
// Accept only paths that start with a single "/" and are not protocol-relative.
export function safeRedirectPath(value, fallback = "/") {
  if (typeof value !== "string") return fallback;
  if (!value.startsWith("/")) return fallback;
  if (value.startsWith("//")) return fallback;
  return value;
}
