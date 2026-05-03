import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { EVENT_CATEGORIES, EVENT_TYPE } from "@lib/constants";
import { useCreateEvent } from "../hooks/useCreateEvent";
import { validateEventForm } from "../lib/validation";

const initialValues = {
  title: "",
  description: "",
  category: "",
  type: EVENT_TYPE.IN_PERSON,
  city: "",
  locationText: "",
  onlineUrl: "",
  startsAt: "",
  imageFile: null,
};

export default function EventCreateForm() {
  const navigate = useNavigate();
  const { mutateAsync, isPending } = useCreateEvent();
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  // Free the object URL when the preview changes or the form unmounts.
  useEffect(() => {
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]);

  const setField = (name, value) => setValues((v) => ({ ...v, [name]: value }));

  const handleImage = (file) => {
    setField("imageFile", file ?? null);
    setImagePreview((current) => {
      if (current) URL.revokeObjectURL(current);
      return file ? URL.createObjectURL(file) : null;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError(null);

    // Convert datetime-local string into a real Date for validation + service.
    const candidate = {
      ...values,
      startsAt: values.startsAt ? new Date(values.startsAt) : null,
    };

    const result = validateEventForm(candidate);
    if (!result.ok) {
      setErrors(result.errors);
      return;
    }
    setErrors({});

    // Strip irrelevant location fields based on type so we don't persist stale values.
    const payload =
      candidate.type === EVENT_TYPE.ONLINE
        ? { ...candidate, city: "", locationText: "" }
        : { ...candidate, onlineUrl: "" };

    try {
      await mutateAsync(payload);
      navigate("/dashboard?created=1");
    } catch (err) {
      setSubmitError(err.message ?? "Etkinlik oluşturulamadı.");
    }
  };

  const isOnline = values.type === EVENT_TYPE.ONLINE;

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
          <legend className="mb-1 block text-sm font-medium text-gray-700">
            Etkinlik tipi
          </legend>
          <div className="flex gap-2">
            {[
              { value: EVENT_TYPE.IN_PERSON, label: "Yüz yüze" },
              { value: EVENT_TYPE.ONLINE, label: "Online" },
            ].map((opt) => {
              const checked = values.type === opt.value;
              return (
                <label
                  key={opt.value}
                  className={[
                    "flex-1 cursor-pointer rounded-md border px-3 py-2 text-center text-sm transition",
                    checked
                      ? "border-gray-900 bg-gray-900 text-white"
                      : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50",
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

      {isOnline ? (
        <Field label="Etkinlik bağlantısı" error={errors.onlineUrl}>
          <input
            type="url"
            value={values.onlineUrl}
            onChange={(e) => setField("onlineUrl", e.target.value)}
            placeholder="https://meet.google.com/…"
            className={inputClass(errors.onlineUrl)}
          />
        </Field>
      ) : (
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

      <Field label="Tarih ve saat" error={errors.startsAt}>
        <input
          type="datetime-local"
          value={values.startsAt}
          onChange={(e) => setField("startsAt", e.target.value)}
          className={inputClass(errors.startsAt)}
        />
      </Field>

      <Field label="Kapak görseli (opsiyonel)" error={errors.imageFile}>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => handleImage(e.target.files?.[0] ?? null)}
          className="block w-full text-sm text-gray-700 file:mr-3 file:rounded-md file:border-0 file:bg-gray-900 file:px-3 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-gray-800"
        />
        {imagePreview && (
          <img
            src={imagePreview}
            alt=""
            className="mt-3 h-40 w-full rounded-md object-cover"
          />
        )}
      </Field>

      {submitError && <p className="text-sm text-red-600">{submitError}</p>}

      <div className="flex flex-col items-start justify-between gap-3 border-t border-gray-200 pt-4 sm:flex-row sm:items-center">
        <p className="text-xs text-gray-500">
          Etkinliğin admin onayından sonra herkese görünür olur.
        </p>
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-60"
        >
          {isPending ? "Gönderiliyor…" : "Onaya gönder"}
        </button>
      </div>
    </form>
  );
}

// Wrapping <label> around a single input gives implicit input-label association
// without needing to manage IDs. For the radio group (multiple inputs) we use
// a <fieldset>/<legend> instead — see above.
function Field({ label, error, children }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-gray-700">{label}</span>
      {children}
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </label>
  );
}

function inputClass(error) {
  return [
    "w-full rounded-md border bg-white px-3 py-2 text-sm shadow-sm",
    "focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-1",
    error ? "border-red-500" : "border-gray-300",
  ].join(" ");
}
