import { EVENT_CATEGORIES, EVENT_TYPE } from "@lib/constants";

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

// Returns { ok: true } or { ok: false, errors: { fieldName: "message" } }.
export function validateEventForm(values) {
  const errors = {};

  const title = values.title?.trim() ?? "";
  if (title.length < 3) errors.title = "Başlık en az 3 karakter olmalı.";
  else if (title.length > 100) errors.title = "Başlık en fazla 100 karakter olabilir.";

  const description = values.description?.trim() ?? "";
  if (description.length < 20) errors.description = "Açıklama en az 20 karakter olmalı.";
  else if (description.length > 2000) errors.description = "Açıklama en fazla 2000 karakter olabilir.";

  if (!EVENT_CATEGORIES.includes(values.category)) {
    errors.category = "Kategori seçin.";
  }

  if (values.type === EVENT_TYPE.IN_PERSON) {
    if (!values.city?.trim()) errors.city = "Şehir zorunlu.";
    if (!values.locationText?.trim()) errors.locationText = "Mekan/adres zorunlu.";
  } else if (values.type === EVENT_TYPE.ONLINE) {
    if (!isValidHttpUrl(values.onlineUrl)) {
      errors.onlineUrl = "Geçerli bir bağlantı girin (http/https).";
    }
  } else if (values.type === EVENT_TYPE.HYBRID) {
    if (!values.city?.trim()) errors.city = "Şehir zorunlu.";
    if (!values.locationText?.trim()) errors.locationText = "Mekan/adres zorunlu.";
    if (!isValidHttpUrl(values.onlineUrl)) {
      errors.onlineUrl = "Geçerli bir online bağlantı girin (http/https).";
    }
  } else {
    errors.type = "Etkinlik tipini seçin.";
  }

  if (!values.startsAt) {
    errors.startsAt = "Tarih ve saat zorunlu.";
  } else {
    const date = values.startsAt instanceof Date ? values.startsAt : new Date(values.startsAt);
    if (Number.isNaN(date.getTime())) errors.startsAt = "Tarih okunamadı.";
    else if (date.getTime() < Date.now()) errors.startsAt = "Tarih gelecekte olmalı.";
  }

  if (values.endsAt) {
    const end = values.endsAt instanceof Date ? values.endsAt : new Date(values.endsAt);
    const start = values.startsAt instanceof Date ? values.startsAt : new Date(values.startsAt);
    if (!Number.isNaN(end.getTime()) && !Number.isNaN(start.getTime())) {
      if (end <= start) errors.endsAt = "Bitiş tarihi başlangıçtan sonra olmalı.";
    }
  }

  if (values.websiteUrl && !isValidHttpsUrl(values.websiteUrl)) {
    errors.websiteUrl = "Geçerli bir https:// adresi girin.";
  }

  if (values.imageFile) {
    if (!values.imageFile.type?.startsWith("image/")) {
      errors.imageFile = "Sadece resim yükleyebilirsin.";
    } else if (values.imageFile.size > MAX_IMAGE_BYTES) {
      errors.imageFile = "Resim 5 MB'tan büyük olamaz.";
    }
  }

  return Object.keys(errors).length === 0 ? { ok: true } : { ok: false, errors };
}

function isValidHttpUrl(value) {
  if (!value) return false;
  try {
    const u = new URL(value);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

function isValidHttpsUrl(value) {
  if (!value) return false;
  try {
    const u = new URL(value);
    return u.protocol === "https:";
  } catch {
    return false;
  }
}
