import { Link, useParams } from "react-router-dom";
import { AttendeeCount, JoinButton, useEventDetail } from "@features/events";
import { formatEventDate } from "@features/events/lib/format";
import { EVENT_STATUS, EVENT_TYPE } from "@lib/constants";
import { usePageTitle } from "@hooks/usePageTitle";

export default function EventDetailPage() {
  const { eventId } = useParams();
  const { data: event, isLoading, isError, error } = useEventDetail(eventId);

  usePageTitle(event?.title ?? null);

  if (isLoading) return <EventDetailSkeleton />;
  if (isError) return <p className="text-sm text-red-600">Hata: {error.message}</p>;
  if (!event) {
    return (
      <div className="space-y-3 py-16 text-center">
        <h1 className="text-xl font-medium text-zinc-900">Etkinlik bulunamadı</h1>
        <Link to="/" className="text-[13.5px] text-zinc-500 underline hover:text-zinc-900">
          Ana sayfaya dön
        </Link>
      </div>
    );
  }

  const isOnline = event.type === EVENT_TYPE.ONLINE;

  return (
    <article className="pb-16">
      {event.status !== EVENT_STATUS.APPROVED && <StatusBadge status={event.status} />}

      {/* Hero image — breaks out of container padding */}
      <div className="relative -mx-4 -mt-8 h-64 overflow-hidden sm:-mx-6 md:h-96">
        {event.imageURL ? (
          <img
            src={event.imageURL}
            alt=""
            loading="lazy"
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="stripe-placeholder-dark h-full w-full" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
      </div>

      {/* Content grid */}
      <div className="mt-10 grid grid-cols-1 gap-12 lg:grid-cols-3">

        {/* Main column */}
        <div className="space-y-8 lg:col-span-2">
          <header className="space-y-5">
            <span className="inline-flex h-6 items-center rounded-full border border-zinc-200 px-2.5 font-mono text-[10.5px] uppercase tracking-[0.14em] text-zinc-700">
              {event.category}
            </span>
            <h1 className="display-tight text-[32px] font-light leading-tight text-zinc-900 md:text-[44px]">
              {event.title}
            </h1>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[13px] text-zinc-600">
              <span className="inline-flex items-center gap-1.5">
                <svg className="h-4 w-4 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <rect x="3.5" y="5" width="17" height="15" rx="2" />
                  <path d="M3.5 10h17M8 3v4M16 3v4" />
                </svg>
                <span className="tabular">{formatEventDate(event.startsAt)}</span>
              </span>
              <span className="inline-flex items-center gap-1.5">
                {isOnline ? (
                  <svg className="h-4 w-4 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <circle cx="12" cy="12" r="9" />
                    <path d="M3 12h18M12 3c2.5 3 2.5 15 0 18M12 3c-2.5 3-2.5 15 0 18" />
                  </svg>
                ) : (
                  <svg className="h-4 w-4 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path d="M12 21s-7-6.2-7-12a7 7 0 0 1 14 0c0 5.8-7 12-7 12Z" />
                    <circle cx="12" cy="9" r="2.5" />
                  </svg>
                )}
                {isOnline ? "Online" : event.city || "—"}
              </span>
            </div>
          </header>

          {event.description && (
            <p className="whitespace-pre-line text-[15px] leading-[1.75] text-zinc-700">
              {event.description}
            </p>
          )}
        </div>

        {/* Sidebar */}
        <aside>
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 space-y-6">
            <div className="flex items-center gap-4">
              <JoinButton eventId={event.id} />
              <AttendeeCount eventId={event.id} />
            </div>

            <div className="border-t border-zinc-100 pt-6 space-y-4 text-[13.5px]">
              <InfoRow label={isOnline ? "Bağlantı" : "Mekan"}>
                {isOnline ? (
                  <a
                    href={event.onlineUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="break-all text-zinc-900 underline decoration-zinc-300 underline-offset-2 hover:decoration-zinc-900"
                  >
                    {event.onlineUrl}
                  </a>
                ) : (
                  <span className="text-zinc-900">{event.locationText || event.city || "—"}</span>
                )}
              </InfoRow>

              <InfoRow label="Tür">
                <span className="text-zinc-900">{isOnline ? "Online" : "Yüz yüze"}</span>
              </InfoRow>
            </div>
          </div>

          <Link
            to="/"
            className="mt-4 flex items-center gap-1.5 text-[12.5px] text-zinc-500 hover:text-zinc-900"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="m15 19-7-7 7-7" />
            </svg>
            Tüm etkinlikler
          </Link>
        </aside>
      </div>
    </article>
  );
}

function InfoRow({ label, children }) {
  return (
    <div>
      <div className="mb-1 font-mono text-[10.5px] uppercase tracking-[0.18em] text-zinc-500">
        {label}
      </div>
      {children}
    </div>
  );
}

function EventDetailSkeleton() {
  return (
    <div className="animate-pulse pb-16">
      <div className="-mx-4 -mt-8 h-64 bg-zinc-100 sm:-mx-6 md:h-96" />
      <div className="mt-10 grid grid-cols-1 gap-12 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          <div className="h-5 w-20 rounded-full bg-zinc-100" />
          <div className="space-y-3">
            <div className="h-9 w-3/4 rounded bg-zinc-100" />
            <div className="h-9 w-1/2 rounded bg-zinc-100" />
          </div>
          <div className="h-4 w-40 rounded bg-zinc-100" />
          <div className="space-y-2 pt-4">
            {[100, 90, 95, 75, 85].map((w, i) => (
              <div key={i} className={`h-3 rounded bg-zinc-100`} style={{ width: `${w}%` }} />
            ))}
          </div>
        </div>
        <div className="h-52 rounded-2xl bg-zinc-100" />
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const config =
    status === EVENT_STATUS.PENDING
      ? { label: "Onay bekliyor", className: "bg-amber-50 text-amber-800 border-amber-200" }
      : { label: "Reddedildi", className: "bg-red-50 text-red-800 border-red-200" };

  return (
    <div className={`mb-6 inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium ${config.className}`}>
      {config.label}
    </div>
  );
}
