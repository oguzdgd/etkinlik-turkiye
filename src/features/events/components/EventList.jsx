import { useMemo } from "react";
import { useEvents } from "../hooks/useEvents";
import EventCard from "./EventCard";

export default function EventList({ pageSize = 12, filters = {} }) {
  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useEvents({ pageSize, filters });

  const events = useMemo(() => data?.pages.flatMap((p) => p.items) ?? [], [data]);

  if (isLoading) {
    return (
      <div className="grid animate-pulse grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }, (_, i) => <EventCardSkeleton key={i} />)}
      </div>
    );
  }
  if (isError) {
    return (
      <p className="text-sm text-red-600">
        Etkinlikler yüklenemedi. Lütfen biraz sonra tekrar deneyin.
      </p>
    );
  }

  if (events.length === 0) {
    return (
      <div className="grid place-items-center rounded-2xl border border-dashed border-zinc-300 py-20 text-center">
        <div className="mb-4 grid h-14 w-14 place-items-center rounded-full border border-zinc-300 text-zinc-400">
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" />
          </svg>
        </div>
        <h3 className="text-[18px] font-medium text-zinc-900">Etkinlik bulunamadı</h3>
        <p className="mt-2 max-w-sm text-[13.5px] text-zinc-500">
          Farklı bir anahtar kelime, şehir veya kategori deneyin.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {events.map((event) => (
          <EventCard key={event.id} event={event} />
        ))}
      </div>

      {hasNextPage && (
        <div className="flex flex-col items-center gap-3">
          <button
            type="button"
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
            className="focus-ring group inline-flex h-12 items-center gap-2 rounded-xl border border-zinc-300 bg-white px-7 text-[13.5px] font-medium text-zinc-900 transition-colors hover:border-zinc-900 hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isFetchingNextPage ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-900" />
                Yükleniyor…
              </>
            ) : (
              "Daha fazla göster"
            )}
          </button>
          <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-zinc-400">
            Listenin sonu değil
          </span>
        </div>
      )}
    </div>
  );
}

function EventCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white">
      <div className="h-44 bg-zinc-100" />
      <div className="p-5 space-y-3">
        <div className="h-5 w-16 rounded-full bg-zinc-100" />
        <div className="h-5 w-3/4 rounded bg-zinc-100" />
        <div className="h-4 w-1/2 rounded bg-zinc-100" />
        <div className="mt-4 h-px bg-zinc-100" />
        <div className="h-3 w-28 rounded bg-zinc-100" />
      </div>
    </div>
  );
}
