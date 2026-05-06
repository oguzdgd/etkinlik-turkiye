import Spinner from "@components/ui/Spinner";
import { useEvents } from "../hooks/useEvents";
import EventCard from "./EventCard";

export default function EventList({ pageSize = 12, filters = {} }) {
  const {
    data,
    isLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useEvents({ pageSize, filters });

  if (isLoading) return <Spinner />;
  if (isError) {
    return (
      <p className="text-sm text-red-600">
        Etkinlikler yüklenemedi: {error.message}
      </p>
    );
  }

  const events = data?.pages.flatMap((p) => p.items) ?? [];

  if (events.length === 0) {
    return <p className="text-sm text-gray-600">Henüz etkinlik yok.</p>;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {events.map((event) => (
          <EventCard key={event.id} event={event} />
        ))}
      </div>

      {hasNextPage && (
        <div className="flex justify-center">
          <button
            type="button"
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50 disabled:opacity-60"
          >
            {isFetchingNextPage ? "Yükleniyor..." : "Daha fazla göster"}
          </button>
        </div>
      )}
    </div>
  );
}
