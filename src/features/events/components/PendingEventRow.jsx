import { useState } from "react";
import { Link } from "react-router-dom";
import { EVENT_STATUS, EVENT_TYPE } from "@lib/constants";
import { formatDateOnly, formatEventDate } from "../lib/format";
import { useModerateEvent } from "../hooks/useModerateEvent";

export default function PendingEventRow({ event }) {
  const { mutate, isPending, variables } = useModerateEvent();
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState("");

  const isOnline = event.type === EVENT_TYPE.ONLINE;
  const isHybrid = event.type === EVENT_TYPE.HYBRID;
  const location = isOnline ? "Online" : isHybrid ? `${event.city || "—"} + Online` : event.city || "—";
  const moderating = isPending && variables?.eventId === event.id;

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-zinc-200 bg-white p-5 sm:flex-row">
      {event.imageURL ? (
        <img
          src={event.imageURL}
          alt=""
          loading="lazy"
          className="h-24 w-full rounded-xl object-cover sm:w-32"
        />
      ) : (
        <div className="stripe-placeholder h-24 w-full rounded-xl sm:w-32" />
      )}

      <div className="flex flex-1 flex-col gap-1 min-w-0">
        <div className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-zinc-500">
          {event.category} · {location}
        </div>
        <Link
          to={`/events/${event.id}`}
          className="truncate text-[15px] font-medium text-zinc-900 hover:underline"
        >
          {event.title}
        </Link>
        <p className="text-[12.5px] text-zinc-500">
          {formatEventDate(event.startsAt, { timeTbd: event.timeTbd })}
          {event.applicationDeadline && (
            <span className="ml-2 text-zinc-400">· Son başvuru: {formatDateOnly(event.applicationDeadline)}</span>
          )}
        </p>
        <p className="clamp-2 mt-1 text-[13px] leading-relaxed text-zinc-600">{event.description}</p>
        {event.websiteUrl && (
          <div className="mt-2 space-y-0.5">
            <a
              href={event.websiteUrl}
              rel="noopener noreferrer nofollow"
              target="_blank"
              className="text-[12.5px] text-zinc-700 underline hover:text-zinc-900"
            >
              Etkinlik sayfası ↗
            </a>
            <div className="font-mono text-[11px] text-zinc-400 break-all">{event.websiteUrl}</div>
          </div>
        )}
      </div>

      <div className="flex flex-row gap-2 sm:flex-col sm:justify-center sm:items-end">
        {rejecting ? (
          <div className="flex flex-col gap-2 sm:items-end">
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Ret gerekçesi (opsiyonel)"
              rows={3}
              className="w-48 rounded-xl border border-zinc-300 px-3 py-2 text-[12px] leading-relaxed text-zinc-700 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:ring-offset-1"
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  mutate({ eventId: event.id, status: EVENT_STATUS.REJECTED, reason: reason.trim() || null });
                  setRejecting(false);
                  setReason("");
                }}
                disabled={moderating}
                className="focus-ring rounded-lg border border-zinc-900 bg-zinc-900 px-3 py-1.5 text-[12px] font-medium text-white hover:bg-zinc-700 disabled:opacity-50"
              >
                Reddi onayla
              </button>
              <button
                type="button"
                onClick={() => { setRejecting(false); setReason(""); }}
                className="focus-ring rounded-lg border border-zinc-300 px-3 py-1.5 text-[12px] font-medium text-zinc-600 hover:bg-zinc-50"
              >
                İptal
              </button>
            </div>
          </div>
        ) : (
          <>
            <button
              type="button"
              onClick={() => mutate({ eventId: event.id, status: EVENT_STATUS.APPROVED })}
              disabled={moderating}
              className="focus-ring h-9 rounded-lg bg-black px-4 text-[12.5px] font-medium text-white transition-colors hover:bg-zinc-800 disabled:opacity-50"
            >
              Onayla
            </button>
            <button
              type="button"
              onClick={() => setRejecting(true)}
              disabled={moderating}
              className="focus-ring h-9 rounded-lg border border-zinc-300 bg-white px-4 text-[12.5px] font-medium text-zinc-700 transition-colors hover:border-zinc-400 hover:bg-zinc-50 disabled:opacity-50"
            >
              Reddet
            </button>
          </>
        )}
      </div>
    </div>
  );
}
