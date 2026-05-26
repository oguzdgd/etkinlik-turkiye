import { useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { AttendeeCount, JoinButton, useEventDetail } from "@features/events";
import { formatDateOnly, formatEventDateRange } from "@features/events/lib/format";
import { EVENT_STATUS, EVENT_TYPE } from "@lib/constants";
import { usePageMeta } from "@hooks/usePageMeta";

function useEventJsonLd(event) {
  useEffect(() => {
    if (!event) return;
    const script = document.createElement("script");
    script.type = "application/ld+json";
    const ld = {
      "@context": "https://schema.org",
      "@type": "Event",
      name: event.title,
      description: event.description,
      startDate: event.startsAt,
      ...(event.endsAt ? { endDate: event.endsAt } : {}),
      ...(event.imageURL ? { image: event.imageURL } : {}),
      url: window.location.href,
      eventAttendanceMode:
        event.type === EVENT_TYPE.ONLINE
          ? "https://schema.org/OnlineEventAttendanceMode"
          : event.type === EVENT_TYPE.HYBRID
          ? "https://schema.org/MixedEventAttendanceMode"
          : "https://schema.org/OfflineEventAttendanceMode",
      location:
        event.type === EVENT_TYPE.ONLINE
          ? { "@type": "VirtualLocation", url: event.onlineUrl || window.location.href }
          : {
              "@type": "Place",
              name: event.locationText || event.city || "Belirtilmedi",
              address: event.city || undefined,
            },
    };
    script.textContent = JSON.stringify(ld);
    document.head.appendChild(script);
    return () => script.remove();
  }, [event]);
}

export default function EventDetailPage() {
  const { eventId } = useParams();
  const { data: event, isLoading, isError, error } = useEventDetail(eventId);

  const desc = event?.description
    ? event.description.slice(0, 160).replace(/\s+/g, " ").trim()
    : null;
  usePageMeta({ title: event?.title ?? null, description: desc, image: event?.imageURL ?? null, type: "event" });
  useEventJsonLd(event);

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
  const isHybrid = event.type === EVENT_TYPE.HYBRID;

  return (
    <article className="pb-16 pt-4">
      {event.status !== EVENT_STATUS.APPROVED && <StatusBadge status={event.status} />}

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-12">

        {/* Left: all content */}
        <div className="order-2 space-y-8 lg:order-1 lg:py-2">

          <header className="space-y-5">
            <span className="inline-flex h-6 items-center rounded-full border border-zinc-200 px-2.5 font-mono text-[10.5px] uppercase tracking-[0.14em] text-zinc-700">
              {event.category}
            </span>
            <h1 className="display-tight text-[28px] font-light leading-tight text-zinc-900 sm:text-[36px] md:text-[42px]">
              {event.title}
            </h1>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[13px] text-zinc-600">
              <span className="inline-flex items-center gap-1.5">
                <svg className="h-4 w-4 shrink-0 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <rect x="3.5" y="5" width="17" height="15" rx="2" />
                  <path d="M3.5 10h17M8 3v4M16 3v4" />
                </svg>
                <span className="tabular">{formatEventDateRange(event.startsAt, event.endsAt, { timeTbd: event.timeTbd })}</span>
              </span>
              <span className="inline-flex items-center gap-1.5">
                {isOnline ? (
                  <svg className="h-4 w-4 shrink-0 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <circle cx="12" cy="12" r="9" />
                    <path d="M3 12h18M12 3c2.5 3 2.5 15 0 18M12 3c-2.5 3-2.5 15 0 18" />
                  </svg>
                ) : (
                  <svg className="h-4 w-4 shrink-0 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path d="M12 21s-7-6.2-7-12a7 7 0 0 1 14 0c0 5.8-7 12-7 12Z" />
                    <circle cx="12" cy="9" r="2.5" />
                  </svg>
                )}
                {isOnline
                  ? (event.onlineUrl
                      ? <a href={event.onlineUrl} target="_blank" rel="noopener noreferrer nofollow" className="underline decoration-zinc-300 underline-offset-2 hover:text-zinc-900 hover:decoration-zinc-900">Online</a>
                      : "Online")
                  : isHybrid ? `${event.city || "—"} · Hibrit` : event.locationText || event.city || "—"}
              </span>
              {event.applicationDeadline && (
                <span className="inline-flex items-center gap-1.5">
                  <svg className="h-4 w-4 shrink-0 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2" />
                    <circle cx="12" cy="12" r="9" />
                  </svg>
                  <span>Son başvuru: <span className="tabular">{formatDateOnly(event.applicationDeadline)}</span></span>
                </span>
              )}
            </div>
            <div className="flex items-center gap-4 pt-1">
              <JoinButton eventId={event.id} />
              <AttendeeCount eventId={event.id} />
              {event.websiteUrl && (
                <a
                  href={event.websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                  className="inline-flex items-center gap-1 text-[12.5px] text-zinc-500 underline decoration-zinc-300 underline-offset-2 hover:text-zinc-900 hover:decoration-zinc-900"
                >
                  Etkinlik sayfası
                  <svg className="h-3 w-3 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                  </svg>
                </a>
              )}
            </div>
          </header>

          {event.description && (
            <p className="whitespace-pre-line text-[15px] leading-[1.75] text-zinc-700">
              {event.description}
            </p>
          )}

          <Link
            to="/"
            className="flex items-center gap-1.5 text-[12.5px] text-zinc-500 hover:text-zinc-900"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="m15 19-7-7 7-7" />
            </svg>
            Tüm etkinlikler
          </Link>
        </div>

        {/* Right: tall sticky image — half the screen */}
        <div className="order-1 lg:order-2 lg:sticky lg:top-24 lg:self-start">
          <div className="h-64 overflow-hidden rounded-2xl bg-zinc-100 sm:h-80 lg:h-[calc(100vh-8rem)]">
            {event.imageURL ? (
              <img
                src={event.imageURL}
                alt=""
                loading="eager"
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="stripe-placeholder-dark h-full w-full" />
            )}
          </div>
        </div>

      </div>
    </article>
  );
}

function EventDetailSkeleton() {
  return (
    <div className="animate-pulse pb-16 pt-4">
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-12">
        <div className="order-2 space-y-5 lg:order-1 lg:py-2">
          <div className="h-5 w-20 rounded-full bg-zinc-100" />
          <div className="space-y-3">
            <div className="h-9 w-3/4 rounded bg-zinc-100" />
            <div className="h-9 w-1/2 rounded bg-zinc-100" />
          </div>
          <div className="h-4 w-40 rounded bg-zinc-100" />
          <div className="space-y-2 pt-2">
            {[100, 90, 95, 75, 85, 92, 78].map((w, i) => (
              <div key={i} className="h-3 rounded bg-zinc-100" style={{ width: `${w}%` }} />
            ))}
          </div>
          <div className="h-44 rounded-2xl bg-zinc-100" />
        </div>
        <div className="order-1 lg:order-2">
          <div className="h-64 rounded-2xl bg-zinc-100 sm:h-80 lg:h-[calc(100vh-8rem)]" />
        </div>
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
