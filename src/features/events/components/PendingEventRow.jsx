import { Link } from "react-router-dom";
import { EVENT_STATUS, EVENT_TYPE } from "@lib/constants";
import { formatEventDate } from "../lib/format";
import { useModerateEvent } from "../hooks/useModerateEvent";

export default function PendingEventRow({ event }) {
  const { mutate, isPending, variables } = useModerateEvent();

  const isOnline = event.type === EVENT_TYPE.ONLINE;
  const location = isOnline ? "Online" : event.city || "—";
  const moderating = isPending && variables?.eventId === event.id;

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-gray-200 bg-white p-4 sm:flex-row">
      {event.imageURL ? (
        <img
          src={event.imageURL}
          alt=""
          className="h-24 w-full rounded-md object-cover sm:w-32"
        />
      ) : (
        <div className="h-24 w-full rounded-md bg-gradient-to-br from-gray-100 to-gray-200 sm:w-32" />
      )}

      <div className="flex flex-1 flex-col gap-1">
        <div className="text-xs font-medium uppercase tracking-wide text-gray-500">
          {event.category} · {location}
        </div>
        <Link
          to={`/events/${event.id}`}
          className="text-base font-semibold text-gray-900 hover:underline"
        >
          {event.title}
        </Link>
        <p className="text-sm text-gray-600">{formatEventDate(event.startsAt)}</p>
        <p className="line-clamp-2 text-sm text-gray-700">{event.description}</p>
      </div>

      <div className="flex flex-row gap-2 sm:flex-col sm:justify-center">
        <button
          type="button"
          onClick={() => mutate({ eventId: event.id, status: EVENT_STATUS.APPROVED })}
          disabled={moderating}
          className="rounded-md bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-500 disabled:opacity-60"
        >
          Onayla
        </button>
        <button
          type="button"
          onClick={() => mutate({ eventId: event.id, status: EVENT_STATUS.REJECTED })}
          disabled={moderating}
          className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-60"
        >
          Reddet
        </button>
      </div>
    </div>
  );
}
