import { memo } from "react";
import { Link } from "react-router-dom";
import { EVENT_TYPE } from "@lib/constants";
import { formatEventDateRange } from "../lib/format";
import { FavoriteButton } from "@features/favorites";

const EventCard = memo(function EventCard({ event }) {
  const isOnline = event.type === EVENT_TYPE.ONLINE;
  const isHybrid = event.type === EVENT_TYPE.HYBRID;
  const location = isOnline ? "Online" : isHybrid ? event.city || "Hibrit" : event.city;

  return (
    <Link
      to={`/events/${event.id}`}
      className="card-hover shadow-card group block overflow-hidden rounded-2xl border border-zinc-200 bg-white"
    >
      {/* Cover */}
      <div className="relative h-44 overflow-hidden">
        {event.imageURL ? (
          <img
            src={event.imageURL}
            alt=""
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <div className="stripe-placeholder absolute inset-0 grid place-items-center">
            <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-zinc-400">
              {event.category}
            </span>
          </div>
        )}

        {/* Favorite */}
        <div className="absolute right-3 top-3">
          <FavoriteButton eventId={event.id} />
        </div>

        {/* Location chip */}
        <div className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 rounded-full border border-white/60 bg-white/90 px-2.5 py-1 text-[11.5px] text-zinc-800 backdrop-blur">
          {isOnline ? (
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <circle cx="12" cy="12" r="9" />
              <path d="M3 12h18M12 3c2.5 3 2.5 15 0 18M12 3c-2.5 3-2.5 15 0 18" />
            </svg>
          ) : (
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path d="M12 21s-7-6.2-7-12a7 7 0 0 1 14 0c0 5.8-7 12-7 12Z" />
              <circle cx="12" cy="9" r="2.5" />
            </svg>
          )}
          <span className="font-medium">{location}</span>
          {isHybrid && <span className="text-zinc-500">· Hibrit</span>}
        </div>
      </div>

      {/* Body */}
      <div className="p-5">
        <div className="mb-3">
          <span className="inline-flex h-6 items-center rounded-full border border-zinc-200 px-2.5 font-mono text-[10.5px] uppercase tracking-[0.14em] text-zinc-700">
            {event.category}
          </span>
        </div>

        <h3 className="clamp-2 text-[17px] font-medium leading-snug tracking-tight text-zinc-900 group-hover:text-black">
          {event.title}
        </h3>

        <div className="mt-5 flex items-center gap-2 border-t border-zinc-100 pt-4 text-[12.5px] text-zinc-600">
          <svg className="h-3.5 w-3.5 shrink-0 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <rect x="3.5" y="5" width="17" height="15" rx="2" />
            <path d="M3.5 10h17M8 3v4M16 3v4" />
          </svg>
          <span className="tabular">{formatEventDateRange(event.startsAt, event.endsAt, { timeTbd: event.timeTbd })}</span>
        </div>
      </div>
    </Link>
  );
});

export default EventCard;
