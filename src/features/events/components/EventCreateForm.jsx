import { useEffect, useState } from "react";
import { EVENT_CATEGORIES, EVENT_TYPE } from "@lib/constants";
import { validateEventForm } from "../lib/validation";

const DEFAULT_VALUES = {
  title: "",
  description: "",
  category: "",
  type: EVENT_TYPE.IN_PERSON,
  city: "",
  locationText: "",
  onlineUrl: "",
  startsAt: "",
  endsAt: "",
  websiteUrl: "",
  imageFile: null,
};

// Converts an ISO/DB timestamp to the YYYY-MM-DDTHH:MM string that
// datetime-local inputs expect (local time, not UTC).
function toDatetimeLocal(value) {
  if (!value) return "";
  const d = new Date(value);
  if (isNaN(d.getTime())) return "";
  const offset = d.getTimezoneOffset() * 60000;
  return new Date(d - offset).toISOString().slice(0, 16);
}

function buildInitialValues(external = {}) {
  return {
    title: external.title ?? "",
    description: external.description ?? "",
    category: external.category ?? "",
    type: external.type ?? EVENT_TYPE.IN_PERSON,
    city: external.city ?? "",
    locationText: external.locationText ?? "",
    onlineUrl: external.onlineUrl ?? "",
    startsAt: toDatetimeLocal(external.startsAt),
    endsAt: toDatetimeLocal(external.endsAt),
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

    const candidate = {
      ...values,
      startsAt: values.startsAt ? new Date(values.startsAt) : null,
      endsAt: values.endsAt ? new Date(values.endsAt) : null,
    };

    const result = validateEventForm(candidate);
    if (!result.ok) {
      setErrors(result.errors);
      return;
    }
    setErrors({});

    // Strip irrelevant location fields so we don't persist stale values.
    let payload = { ...candidate };
    if (candidate.type === EVENT_TYPE.ONLINE) {
      payload = { ...payload, city: "", locationText: "" };
    } else if (candidate.type === EVENT_TYPE.IN_PERSON) {
      payload = { ...payload, onlineUrl: "" };
    }
    // hybrid: keep all fields

    try {
      await onSubmit(payload);
    } catch (err) {
      setSubmitError(err.message ?? "İşlem tamamlanamadı.");
    }
  };

  const isOnline = values.type === EVENT_TYPE.ONLINE;
  const isHybrid = values.type === EVENT_TYPE.HYBRID;
  const showLocation = !isOnline; // in_person + hybrid
  const showOnlineUrl = isOnline || isHybrid;

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      <Field label="Başlık" error={errors.title}>
        <input
          type="text"
          value={values.title}
          onChange={(e) => setField("title", e.target.value)}
          className={inputClass(errors.title)}
          maxLength={100}
        />
      </Field>

      <Field label="Açıklama" error={errors.description}>
        <textarea
          value={values.description}
          onChange={(e) => setField("description", e.target.value)}
          rows={6}
          className={inputClass(errors.description)}
          maxLength={2000}
        />
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Kategori" error={errors.category}>
          <select
            value={values.category}
            onChange={(e) => setField("category", e.target.value)}
            className={inputClass(errors.category)}
          >
            <option value="">Seçin…</option>
            {EVENT_CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </Field>

        <fieldset>
          <legend className="mb-1 block text-sm font-medium text-zinc-700">
            Etkinlik tipi
          </legend>
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
      </div>

      {showLocation && (
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Şehir" error={errors.city}>
            <input
              type="text"
              value={values.city}
              onChange={(e) => setField("city", e.target.value)}
              className={inputClass(errors.city)}
            />
          </Field>
          <Field label="Mekan / adres" error={errors.locationText}>
            <input
              type="text"
              value={values.locationText}
              onChange={(e) => setField("locationText", e.target.value)}
              className={inputClass(errors.locationText)}
            />
          </Field>
        </div>
      )}

      {showOnlineUrl && (
        <Field
          label={isHybrid ? "Online bağlantı (hibrit)" : "Etkinlik bağlantısı"}
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

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Başlangıç tarihi ve saati" error={errors.startsAt}>
          <input
            type="datetime-local"
            value={values.startsAt}
            onChange={(e) => setField("startsAt", e.target.value)}
            className={inputClass(errors.startsAt)}
          />
        </Field>
        <Field label="Bitiş tarihi (opsiyonel)" error={errors.endsAt}>
          <input
            type="datetime-local"
            value={values.endsAt}
            min={values.startsAt || undefined}
            onChange={(e) => setField("endsAt", e.target.value)}
            className={inputClass(errors.endsAt)}
          />
        </Field>
      </div>

      <Field label="Etkinlik sayfası (opsiyonel)" error={errors.websiteUrl}>
        <input
          type="url"
          value={values.websiteUrl}
          onChange={(e) => setField("websiteUrl", e.target.value)}
          placeholder="https://etkinlik.com/kayit"
          className={inputClass(errors.websiteUrl)}
        />
      </Field>

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
      <span className="mb-1 block text-sm font-medium text-zinc-700">{label}</span>
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
