import { Link } from "react-router-dom";
import { EVENT_TYPE } from "@lib/constants";
import { formatEventDate } from "../lib/format";
import { FavoriteButton } from "@features/favorites";

export default function EventCard({ event }) {
  const location = event.type === EVENT_TYPE.ONLINE ? "Online" : event.city;

  return (
    <Link
      to={`/events/${event.id}`}
      className="group flex flex-col overflow-hidden rounded-lg border border-gray-200 bg-white transition hover:border-gray-300 hover:shadow-sm"
    >
      <div className="relative">
        {event.imageURL ? (
          <img
            src={event.imageURL}
            alt=""
            loading="lazy"
            className="h-40 w-full object-cover"
          />
        ) : (
          <div className="h-40 w-full bg-gradient-to-br from-gray-100 to-gray-200" />
        )}
        <div className="absolute right-2 top-2">
          <FavoriteButton eventId={event.id} />
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-1.5 p-4">
        <div className="text-xs font-medium uppercase tracking-wide text-gray-500">
          {event.category} · {location}
        </div>
        <h3 className="line-clamp-2 text-base font-semibold text-gray-900 group-hover:text-gray-700">
          {event.title}
        </h3>
        <div className="mt-auto pt-2 text-sm text-gray-600">
          {formatEventDate(event.startsAt)}
        </div>
      </div>
    </Link>
  );
}
