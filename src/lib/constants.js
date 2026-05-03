export const ROLES = Object.freeze({
  USER: "user",
  ADMIN: "admin",
});

export const EVENT_STATUS = Object.freeze({
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
});

export const EVENT_TYPE = Object.freeze({
  ONLINE: "online",
  IN_PERSON: "in_person",
});

export const EVENT_CATEGORIES = Object.freeze([
  "Hackathon",
  "AI",
  "Yazılım",
  "Workshop",
  "Kariyer",
  "Networking",
  "Diğer",
]);

export const ROUTES = Object.freeze({
  HOME: "/",
  LOGIN: "/login",
  REGISTER: "/register",
  DASHBOARD: "/dashboard",
  ADMIN: "/admin",
  EVENTS: "/events",
  EVENT_NEW: "/events/new",
});
