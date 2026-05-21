import { useEffect, useState } from "react";
import { CATEGORY_DESCRIPTIONS, EVENT_CATEGORIES, EVENT_TYPE } from "@lib/constants";
import { validateEventForm } from "../lib/validation";

// Converts an ISO/DB timestamp to local date (YYYY-MM-DD) and time (HH:MM) strings.
function splitToLocal(value) {
  if (!value) return { date: "", time: "" };
  const d = new Date(value);
  if (isNaN(d.getTime())) return { date: "", time: "" };
  const offset = d.getTimezoneOffset() * 60000;
  const local = new Date(d.getTime() - offset).toISOString();
  return { date: local.slice(0, 10), time: local.slice(11, 16) };
}

function toDatetimeLocal(value) {
  if (!value) return "";
  const d = new Date(value);
  if (isNaN(d.getTime())) return "";
  const offset = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - offset).toISOString().slice(0, 16);
}

function toLocalDate(value) {
  if (!value) return "";
  const d = new Date(value);
  if (isNaN(d.getTime())) return "";
  const offset = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - offset).toISOString().slice(0, 10);
}

function buildInitialValues(external = {}) {
  const { date: startsDate, time: startsTime } = splitToLocal(external.startsAt);
  return {
    title: external.title ?? "",
    description: external.description ?? "",
    category: external.category ?? "",
    type: external.type ?? EVENT_TYPE.IN_PERSON,
    city: external.city ?? "",
    locationText: external.locationText ?? "",
    onlineUrl: external.onlineUrl ?? "",
    startsDate,
    startsTime: external.timeTbd ? "" : startsTime,
    endsAt: toDatetimeLocal(external.endsAt),
    applicationDeadline: toLocalDate(external.applicationDeadline),
    websiteUrl: external.websiteUrl ?? "",
    imageFile: null,
  };
}

export default function EventCreateForm({
  initialValues: externalInitialValues = {},
  onSubmit,
  isPending = false,
  submitLabel = "Onaya gönder",
}) {
  const [values, setValues] = useState(() => buildInitialValues(externalInitialValues));
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState(null);
  const [imagePreview, setImagePreview] = useState(externalInitialValues?.imageURL ?? null);

  useEffect(() => {
    return () => {
      if (imagePreview?.startsWith("blob:")) URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]);

  const setField = (name, value) => setValues((v) => ({ ...v, [name]: value }));

  const handleImage = (file) => {
    setField("imageFile", file ?? null);
    setImagePreview((current) => {
      if (current?.startsWith("blob:")) URL.revokeObjectURL(current);
      return file ? URL.createObjectURL(file) : null;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError(null);

    const timeTbd = !values.startsTime;
    const startsAt = values.startsDate
      ? new Date(values.startsDate + "T" + (values.startsTime || "12:00") + ":00")
      : null;

    const candidate = {
      ...values,
      timeTbd,
      startsAt,
      endsAt: values.endsAt ? new Date(values.endsAt) : null,
      applicationDeadline: values.applicationDeadline
        ? new Date(values.applicationDeadline + "T23:59:59")
        : null,
    };

    const result = validateEventForm(candidate);
    if (!result.ok) {
      setErrors(result.errors);
      return;
    }
    setErrors({});

    let payload = { ...candidate };
    if (candidate.type === EVENT_TYPE.ONLINE) {
      payload = { ...payload, city: "", locationText: "" };
    } else if (candidate.type === EVENT_TYPE.IN_PERSON) {
      payload = { ...payload, onlineUrl: "" };
    }

    try {
      await onSubmit(payload);
    } catch (err) {
      setSubmitError(err.message ?? "İşlem tamamlanamadı.");
    }
  };

  const isOnline = values.type === EVENT_TYPE.ONLINE;
  const isHybrid = values.type === EVENT_TYPE.HYBRID;
  const showLocation = !isOnline;
  const showOnlineUrl = isOnline || isHybrid;
  const todayDate = new Date().toISOString().slice(0, 10);

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6">

      {/* Başlık */}
      <Field label="Başlık *" error={errors.title}>
        <input
          type="text"
          value={values.title}
          onChange={(e) => setField("title", e.target.value)}
          placeholder="Etkinlik başlığı"
          className={inputClass(errors.title)}
          maxLength={100}
        />
      </Field>

      {/* Açıklama */}
      <Field label="Açıklama *" error={errors.description}>
        <textarea
          value={values.description}
          onChange={(e) => setField("description", e.target.value)}
          rows={5}
          placeholder="Etkinliği kısaca anlat — en az 20 karakter"
          className={inputClass(errors.description)}
          maxLength={2000}
        />
      </Field>

      {/* Kategori */}
      <div>
        <span className="mb-2 block text-sm font-medium text-zinc-700">Kategori *</span>
        <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3 lg:grid-cols-4">
          {EVENT_CATEGORIES.map((cat) => {
            const checked = values.category === cat;
            return (
              <label
                key={cat}
                className={[
                  "relative flex cursor-pointer items-center justify-between gap-1 rounded-xl border px-3 py-2 text-[13px] transition",
                  checked
                    ? "border-zinc-900 bg-zinc-900 text-white"
                    : "border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-50",
                ].join(" ")}
              >
                <input
                  type="radio"
                  name="category"
                  value={cat}
                  checked={checked}
                  onChange={() => setField("category", cat)}
                  className="sr-only"
                />
                <span>{cat}</span>
                <span className="group relative ml-auto shrink-0">
                  <span
                    className={[
                      "inline-flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold leading-none",
                      checked ? "bg-white/20 text-white" : "bg-zinc-100 text-zinc-500",
                    ].join(" ")}
                  >
                    ?
                  </span>
                  <span className="pointer-events-none absolute bottom-full right-0 z-50 mb-2 w-52 rounded-xl bg-zinc-900 p-2.5 text-[11.5px] leading-relaxed text-white opacity-0 transition-opacity group-hover:opacity-100">
                    {CATEGORY_DESCRIPTIONS[cat]}
                    <span className="absolute -bottom-1 right-3 h-2 w-2 rotate-45 bg-zinc-900" />
                  </span>
                </span>
              </label>
            );
          })}
        </div>
        {errors.category && <p className="mt-1 text-sm text-red-600">{errors.category}</p>}
      </div>

      {/* Etkinlik tipi */}
      <fieldset>
        <legend className="mb-2 block text-sm font-medium text-zinc-700">Etkinlik tipi *</legend>
        <div className="flex gap-2">
          {[
            { value: EVENT_TYPE.IN_PERSON, label: "Yüz yüze" },
            { value: EVENT_TYPE.ONLINE, label: "Online" },
            { value: EVENT_TYPE.HYBRID, label: "Hibrit" },
          ].map((opt) => {
            const checked = values.type === opt.value;
            return (
              <label
                key={opt.value}
                className={[
                  "flex-1 cursor-pointer rounded-xl border px-3 py-2 text-center text-[13px] transition",
                  checked
                    ? "border-zinc-900 bg-zinc-900 text-white"
                    : "border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-50",
                ].join(" ")}
              >
                <input
                  type="radio"
                  name="type"
                  value={opt.value}
                  checked={checked}
                  onChange={() => setField("type", opt.value)}
                  className="sr-only"
                />
                {opt.label}
              </label>
            );
          })}
        </div>
        {errors.type && <p className="mt-1 text-sm text-red-600">{errors.type}</p>}
      </fieldset>

      {/* Konum */}
      {showLocation && (
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Şehir *" error={errors.city}>
            <input
              type="text"
              value={values.city}
              onChange={(e) => setField("city", e.target.value)}
              placeholder="İstanbul"
              className={inputClass(errors.city)}
            />
          </Field>
          <Field label="Mekan / adres *" error={errors.locationText}>
            <input
              type="text"
              value={values.locationText}
              onChange={(e) => setField("locationText", e.target.value)}
              placeholder="Venue adı veya adres"
              className={inputClass(errors.locationText)}
            />
          </Field>
        </div>
      )}

      {/* Online bağlantı */}
      {showOnlineUrl && (
        <Field
          label={isHybrid ? "Online bağlantı (opsiyonel)" : "Etkinlik bağlantısı (opsiyonel)"}
          error={errors.onlineUrl}
        >
          <input
            type="url"
            value={values.onlineUrl}
            onChange={(e) => setField("onlineUrl", e.target.value)}
            placeholder="https://meet.google.com/…"
            className={inputClass(errors.onlineUrl)}
          />
        </Field>
      )}

      {/* Tarihler */}
      <div className="space-y-4">
        <div className="grid gap-5 sm:grid-cols-2">
          {/* Başlangıç tarihi */}
          <Field label="Başlangıç tarihi *" error={errors.startsAt}>
            <input
              type="date"
              value={values.startsDate}
              min={todayDate}
              onChange={(e) => setField("startsDate", e.target.value)}
              className={inputClass(errors.startsAt)}
            />
          </Field>

          {/* Başlangıç saati */}
          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <span className="text-sm font-medium text-zinc-700">Başlangıç saati</span>
              <label className="flex cursor-pointer select-none items-center gap-1.5 text-[12px] text-zinc-500">
                <input
                  type="checkbox"
                  checked={values.startsTime === ""}
                  onChange={(e) =>
                    setField("startsTime", e.target.checked ? "" : "09:00")
                  }
                  className="h-3.5 w-3.5 rounded accent-zinc-900"
                />
                Saat belirsiz
              </label>
            </div>
            <input
              type="time"
              value={values.startsTime}
              disabled={values.startsTime === ""}
              onChange={(e) => setField("startsTime", e.target.value)}
              className={[
                "w-full rounded-xl border px-3 py-2.5 text-[13.5px]",
                "focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:ring-offset-1",
                values.startsTime === ""
                  ? "cursor-not-allowed border-zinc-200 bg-zinc-50 text-zinc-400"
                  : "border-zinc-300 bg-white hover:border-zinc-400",
              ].join(" ")}
            />
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          {/* Bitiş */}
          <Field label="Bitiş (opsiyonel)" error={errors.endsAt}>
            <input
              type="datetime-local"
              value={values.endsAt}
              min={
                values.startsDate
                  ? values.startsDate + "T" + (values.startsTime || "00:00")
                  : undefined
              }
              onChange={(e) => setField("endsAt", e.target.value)}
              className={inputClass(errors.endsAt)}
            />
          </Field>

          {/* Son başvuru tarihi */}
          <Field label="Son başvuru tarihi (opsiyonel)" error={errors.applicationDeadline}>
            <input
              type="date"
              value={values.applicationDeadline}
              min={todayDate}
              max={values.startsDate || undefined}
              onChange={(e) => setField("applicationDeadline", e.target.value)}
              className={inputClass(errors.applicationDeadline)}
            />
          </Field>
        </div>
      </div>

      {/* Etkinlik sayfası */}
      <Field label="Etkinlik sayfası (opsiyonel)" error={errors.websiteUrl}>
        <input
          type="url"
          value={values.websiteUrl}
          onChange={(e) => setField("websiteUrl", e.target.value)}
          placeholder="https://etkinlik.com/kayit"
          className={inputClass(errors.websiteUrl)}
        />
      </Field>

      {/* Kapak görseli */}
      <Field label="Kapak görseli (opsiyonel)" error={errors.imageFile}>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => handleImage(e.target.files?.[0] ?? null)}
          className="block w-full text-sm text-zinc-700 file:mr-3 file:rounded-lg file:border-0 file:bg-zinc-900 file:px-3 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-zinc-800"
        />
        {imagePreview && (
          <img
            src={imagePreview}
            alt=""
            className="mt-3 h-40 w-full rounded-xl object-cover"
          />
        )}
      </Field>

      {submitError && <p className="text-sm text-red-600">{submitError}</p>}

      <div className="flex flex-col items-start justify-between gap-3 border-t border-zinc-200 pt-4 sm:flex-row sm:items-center">
        <p className="text-xs text-zinc-500">
          Etkinliğin admin onayından sonra herkese görünür olur.
        </p>
        <button
          type="submit"
          disabled={isPending}
          className="focus-ring inline-flex items-center gap-2 rounded-xl bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-60"
        >
          {isPending && (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-600 border-t-white" />
          )}
          {isPending ? "Gönderiliyor…" : submitLabel}
        </button>
      </div>
    </form>
  );
}

function Field({ label, error, children }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-zinc-700">{label}</span>
      {children}
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </label>
  );
}

function inputClass(error) {
  return [
    "w-full rounded-xl border bg-white px-3 py-2.5 text-[13.5px]",
    "focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:ring-offset-1",
    error ? "border-red-400" : "border-zinc-300 hover:border-zinc-400",
  ].join(" ");
}
