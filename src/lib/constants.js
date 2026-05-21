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
  HYBRID: "hybrid",
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

export const CATEGORY_DESCRIPTIONS = Object.freeze({
  Hackathon: "Yarışma formatında yazılım geliştirme — genellikle 24–48 saat kesintisiz kodlama ve sunum",
  AI: "Yapay zeka, makine öğrenmesi ve büyük dil modeli odaklı etkinlikler",
  Yazılım: "Genel yazılım geliştirme: programlama dilleri, framework'ler, araçlar ve mimari",
  Workshop: "Uygulamalı öğrenme — belirli bir konuya odaklanan küçük grup çalışmaları",
  Kariyer: "İş ilanları, mentorluk, CV hazırlama ve kariyer gelişimi etkinlikleri",
  Networking: "Profesyoneller arası bağlantı kurma ve sosyal buluşmalar",
  Diğer: "Yukarıdaki kategorilere girmeyen teknoloji etkinlikleri",
});

export const ROUTES = Object.freeze({
  HOME: "/",
  LOGIN: "/login",
  REGISTER: "/register",
  DASHBOARD: "/dashboard",
  ADMIN: "/admin",
  EVENTS: "/",
  EVENT_NEW: "/events/new",
  MAP: "/events/map",
  CATEGORIES: "/categories",
  CITIES: "/cities",
  CALENDAR: "/calendar",
  PROFILE: "/profile",
});
