import { Link, useParams } from "react-router-dom";
import Spinner from "@components/ui/Spinner";
import {
  AttendeeCount,
  JoinButton,
  useEventDetail,
} from "@features/events";
import { formatEventDate } from "@features/events/lib/format";
import { EVENT_STATUS, EVENT_TYPE } from "@lib/constants";

export default function EventDetailPage() {
  const { eventId } = useParams();
  const { data: event, isLoading, isError, error } = useEventDetail(eventId);

  if (isLoading) return <Spinner />;
  if (isError) {
    return <p className="text-sm text-red-600">Hata: {error.message}</p>;
  }
  if (!event) {
    return (
      <div className="space-y-3">
        <h1 className="text-xl font-semibold">Etkinlik bulunamadı</h1>
        <Link to="/events" className="text-sm underline">
          Etkinliklere dön
        </Link>
      </div>
    );
  }

  const isOnline = event.type === EVENT_TYPE.ONLINE;
  const headerLocation = isOnline ? "Online" : event.city;

  return (
    <article className="space-y-6">
      {event.status !== EVENT_STATUS.APPROVED && <StatusBadge status={event.status} />}

      {event.imageURL && (
        <img
          src={event.imageURL}
          alt=""
          className="h-64 w-full rounded-lg object-cover"
        />
      )}

      <header className="space-y-2">
        <div className="text-xs font-medium uppercase tracking-wide text-gray-500">
          {event.category} · {headerLocation}
        </div>
        <h1 className="text-3xl font-bold tracking-tight">{event.title}</h1>
        <p className="text-sm text-gray-600">{formatEventDate(event.startsAt)}</p>
      </header>

      <div className="rounded-md border border-gray-200 bg-gray-50 p-4 text-sm text-gray-800">
        {isOnline ? (
          <>
            <span className="font-medium">Bağlantı: </span>
            <a
              href={event.onlineUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="break-all underline"
            >
              {event.onlineUrl}
            </a>
          </>
        ) : (
          <>
            <span className="font-medium">Mekan: </span>
            {event.locationText}
          </>
        )}
      </div>

      <div className="flex items-center gap-4">
        <JoinButton eventId={event.id} />
        <AttendeeCount eventId={event.id} />
      </div>

      <p className="whitespace-pre-line leading-relaxed text-gray-800">
        {event.description}
      </p>
    </article>
  );
}

// Visible only to the owner / admin (rules deny everyone else from reading the doc).
function StatusBadge({ status }) {
  const config =
    status === EVENT_STATUS.PENDING
      ? { label: "Onay bekliyor", className: "bg-amber-50 text-amber-800 border-amber-200" }
      : { label: "Reddedildi", className: "bg-red-50 text-red-800 border-red-200" };

  return (
    <div
      className={`inline-flex items-center rounded-md border px-3 py-1 text-xs font-medium ${config.className}`}
    >
      {config.label}
    </div>
  );
}
