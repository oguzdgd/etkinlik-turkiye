import { EVENT_CATEGORIES, EVENT_TYPE } from "@lib/constants";

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

// Returns { ok: true } or { ok: false, errors: { fieldName: "message" } }.
// Co-located with the form so the failure surface is one file to read.
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
