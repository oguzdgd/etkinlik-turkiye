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
  "Konferans",
  "Meetup",
  "Workshop",
  "Bootcamp",
  "Staj",
  "Yarışma",
  "AI",
  "Kariyer",
  "Networking",
  "Diğer",
]);

export const CATEGORY_DESCRIPTIONS = Object.freeze({
  Hackathon: "Yarışma formatında yazılım geliştirme — genellikle 24–48 saat kesintisiz kodlama ve sunum",
  Konferans: "Çok konuşmacılı büyük teknik etkinlikler — keynote, panel ve oturumlarla",
  Meetup: "Topluluk buluşmaları — belirli bir teknoloji veya konu etrafında düzenli toplanmalar",
  Workshop: "Uygulamalı öğrenme — belirli bir konuya odaklanan küçük grup çalışmaları",
  Bootcamp: "Yoğun ve yapılandırılmış yazılım eğitim programları — genellikle haftalar veya aylar sürer",
  Staj: "Yazılım ve teknoloji alanında ücretli veya gönüllü staj ve çalışma programları",
  Yarışma: "Kod, tasarım veya ürün yarışmaları — genellikle ödüllü ve belirli süre sınırlı",
  AI: "Yapay zeka, makine öğrenmesi ve büyük dil modeli odaklı etkinlikler",
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

// Converts a display name to a URL-safe slug (Turkish chars → ASCII).
export function slugify(str) {
  return str
    .toLowerCase()
    .replace(/ı/g, "i").replace(/İ/g, "i")
    .replace(/ş/g, "s").replace(/Ş/g, "s")
    .replace(/ğ/g, "g").replace(/Ğ/g, "g")
    .replace(/ü/g, "u").replace(/Ü/g, "u")
    .replace(/ö/g, "o").replace(/Ö/g, "o")
    .replace(/ç/g, "c").replace(/Ç/g, "c")
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

// All 81 Turkish provinces + Online, with pre-computed slugs and regions.
export const CITIES = Object.freeze([
  // Marmara
  { name: "İstanbul",       slug: "istanbul",       region: "Marmara" },
  { name: "Bursa",          slug: "bursa",          region: "Marmara" },
  { name: "Kocaeli",        slug: "kocaeli",        region: "Marmara" },
  { name: "Tekirdağ",       slug: "tekirdag",       region: "Marmara" },
  { name: "Edirne",         slug: "edirne",         region: "Marmara" },
  { name: "Sakarya",        slug: "sakarya",        region: "Marmara" },
  { name: "Balıkesir",      slug: "balikesir",      region: "Marmara" },
  { name: "Çanakkale",      slug: "canakkale",      region: "Marmara" },
  { name: "Kırklareli",     slug: "kirklareli",     region: "Marmara" },
  { name: "Bilecik",        slug: "bilecik",        region: "Marmara" },
  { name: "Yalova",         slug: "yalova",         region: "Marmara" },
  { name: "Bolu",           slug: "bolu",           region: "Karadeniz" },
  { name: "Düzce",          slug: "duzce",          region: "Karadeniz" },
  // Ege
  { name: "İzmir",          slug: "izmir",          region: "Ege" },
  { name: "Manisa",         slug: "manisa",         region: "Ege" },
  { name: "Aydın",          slug: "aydin",          region: "Ege" },
  { name: "Denizli",        slug: "denizli",        region: "Ege" },
  { name: "Muğla",          slug: "mugla",          region: "Ege" },
  { name: "Kütahya",        slug: "kutahya",        region: "Ege" },
  { name: "Afyonkarahisar", slug: "afyonkarahisar", region: "Ege" },
  { name: "Uşak",           slug: "usak",           region: "Ege" },
  // Akdeniz
  { name: "Antalya",        slug: "antalya",        region: "Akdeniz" },
  { name: "Mersin",         slug: "mersin",         region: "Akdeniz" },
  { name: "Adana",          slug: "adana",          region: "Akdeniz" },
  { name: "Hatay",          slug: "hatay",          region: "Akdeniz" },
  { name: "Isparta",        slug: "isparta",        region: "Akdeniz" },
  { name: "Burdur",         slug: "burdur",         region: "Akdeniz" },
  { name: "Kahramanmaraş",  slug: "kahramanmaras",  region: "Akdeniz" },
  { name: "Osmaniye",       slug: "osmaniye",       region: "Akdeniz" },
  { name: "Karaman",        slug: "karaman",        region: "Akdeniz" },
  // İç Anadolu
  { name: "Ankara",         slug: "ankara",         region: "İç Anadolu" },
  { name: "Konya",          slug: "konya",          region: "İç Anadolu" },
  { name: "Eskişehir",      slug: "eskisehir",      region: "İç Anadolu" },
  { name: "Kayseri",        slug: "kayseri",        region: "İç Anadolu" },
  { name: "Sivas",          slug: "sivas",          region: "İç Anadolu" },
  { name: "Yozgat",         slug: "yozgat",         region: "İç Anadolu" },
  { name: "Kırıkkale",      slug: "kirikkale",      region: "İç Anadolu" },
  { name: "Aksaray",        slug: "aksaray",        region: "İç Anadolu" },
  { name: "Nevşehir",       slug: "nevsehir",       region: "İç Anadolu" },
  { name: "Niğde",          slug: "nigde",          region: "İç Anadolu" },
  { name: "Kırşehir",       slug: "kirsehir",       region: "İç Anadolu" },
  { name: "Çankırı",        slug: "cankiri",        region: "İç Anadolu" },
  // Karadeniz
  { name: "Samsun",         slug: "samsun",         region: "Karadeniz" },
  { name: "Trabzon",        slug: "trabzon",        region: "Karadeniz" },
  { name: "Ordu",           slug: "ordu",           region: "Karadeniz" },
  { name: "Giresun",        slug: "giresun",        region: "Karadeniz" },
  { name: "Rize",           slug: "rize",           region: "Karadeniz" },
  { name: "Artvin",         slug: "artvin",         region: "Karadeniz" },
  { name: "Kastamonu",      slug: "kastamonu",      region: "Karadeniz" },
  { name: "Sinop",          slug: "sinop",          region: "Karadeniz" },
  { name: "Çorum",          slug: "corum",          region: "Karadeniz" },
  { name: "Amasya",         slug: "amasya",         region: "Karadeniz" },
  { name: "Tokat",          slug: "tokat",          region: "Karadeniz" },
  { name: "Gümüşhane",      slug: "gumushane",      region: "Karadeniz" },
  { name: "Bayburt",        slug: "bayburt",        region: "Karadeniz" },
  { name: "Zonguldak",      slug: "zonguldak",      region: "Karadeniz" },
  { name: "Karabük",        slug: "karabuk",        region: "Karadeniz" },
  { name: "Bartın",         slug: "bartin",         region: "Karadeniz" },
  // Doğu Anadolu
  { name: "Erzurum",        slug: "erzurum",        region: "Doğu Anadolu" },
  { name: "Malatya",        slug: "malatya",        region: "Doğu Anadolu" },
  { name: "Elazığ",         slug: "elazig",         region: "Doğu Anadolu" },
  { name: "Erzincan",       slug: "erzincan",       region: "Doğu Anadolu" },
  { name: "Van",            slug: "van",            region: "Doğu Anadolu" },
  { name: "Muş",            slug: "mus",            region: "Doğu Anadolu" },
  { name: "Bitlis",         slug: "bitlis",         region: "Doğu Anadolu" },
  { name: "Hakkari",        slug: "hakkari",        region: "Doğu Anadolu" },
  { name: "Ağrı",           slug: "agri",           region: "Doğu Anadolu" },
  { name: "Kars",           slug: "kars",           region: "Doğu Anadolu" },
  { name: "Ardahan",        slug: "ardahan",        region: "Doğu Anadolu" },
  { name: "Iğdır",          slug: "igdir",          region: "Doğu Anadolu" },
  { name: "Bingöl",         slug: "bingol",         region: "Doğu Anadolu" },
  { name: "Tunceli",        slug: "tunceli",        region: "Doğu Anadolu" },
  // Güneydoğu Anadolu
  { name: "Gaziantep",      slug: "gaziantep",      region: "Güneydoğu Anadolu" },
  { name: "Şanlıurfa",      slug: "sanliurfa",      region: "Güneydoğu Anadolu" },
  { name: "Diyarbakır",     slug: "diyarbakir",     region: "Güneydoğu Anadolu" },
  { name: "Mardin",         slug: "mardin",         region: "Güneydoğu Anadolu" },
  { name: "Batman",         slug: "batman",         region: "Güneydoğu Anadolu" },
  { name: "Şırnak",         slug: "sirnak",         region: "Güneydoğu Anadolu" },
  { name: "Siirt",          slug: "siirt",          region: "Güneydoğu Anadolu" },
  { name: "Adıyaman",       slug: "adiyaman",       region: "Güneydoğu Anadolu" },
  { name: "Kilis",          slug: "kilis",          region: "Güneydoğu Anadolu" },
  // Uzaktan
  { name: "Online",         slug: "online",         region: "Uzaktan" },
]);

export function categoryFromSlug(slug) {
  return EVENT_CATEGORIES.find((c) => slugify(c) === slug) ?? null;
}

export function cityFromSlug(slug) {
  return CITIES.find((c) => c.slug === slug) ?? null;
}
