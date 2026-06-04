import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useAuth } from "@features/auth";
import { useUserEvents, useUserJoinedEvents, useLeaveEvent, useDeleteEvent } from "@features/events";
import { useUserFavoriteEvents } from "@features/favorites";
import { EVENT_STATUS, ROUTES } from "@lib/constants";
import { formatEventDate, isPast } from "@features/events/lib/format";

const TABS = [
  { id: "mine", label: "Etkinliklerim" },
  { id: "favorites", label: "Favorilerim" },
  { id: "joined", label: "Katıldıklarım" },
];

const STATUS_BADGE = {
  [EVENT_STATUS.PENDING]: "bg-yellow-100 text-yellow-800",
  [EVENT_STATUS.APPROVED]: "bg-green-100 text-green-800",
  [EVENT_STATUS.REJECTED]: "bg-red-100 text-red-800",
};

const STATUS_LABEL = {
  [EVENT_STATUS.PENDING]: "Beklemede",
  [EVENT_STATUS.APPROVED]: "Yayında",
  [EVENT_STATUS.REJECTED]: "Reddedildi",
};

export default function DashboardPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("mine");
  const [searchParams, setSearchParams] = useSearchParams();
  const showUpdated = searchParams.get("updated") === "1";

  useEffect(() => {
    if (showUpdated) {
      const t = setTimeout(() => {
        setSearchParams((p) => { p.delete("updated"); return p; }, { replace: true });
      }, 4000);
      return () => clearTimeout(t);
    }
  }, [showUpdated, setSearchParams]);

  return (
    <section className="space-y-6">
      {showUpdated && (
        <div className="flex items-center gap-2 rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-700">
          <svg className="h-4 w-4 shrink-0 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
          </svg>
          Etkinlik güncellendi — admin onayından sonra yayına girecek.
        </div>
      )}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Panelim</h1>
          <p className="text-sm text-gray-500 mt-1">
            {user.displayName || user.email}
          </p>
        </div>
        <Link
          to={ROUTES.EVENT_NEW}
          className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 transition"
        >
          + Etkinlik Oluştur
        </Link>
      </div>

      <div className="border-b border-gray-200">
        <nav className="flex gap-6">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-3 text-sm font-medium border-b-2 transition ${
                activeTab === tab.id
                  ? "border-gray-900 text-gray-900"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {activeTab === "mine" && <MyEventsTab />}
      {activeTab === "favorites" && <FavoritesTab />}
      {activeTab === "joined" && <JoinedTab />}
    </section>
  );
}

function MyEventsTab() {
  const { data: events = [], isLoading } = useUserEvents();
  const { mutate: deleteEvent, isPending: isDeleting, variables: deletingId } = useDeleteEvent();
  const [confirmingId, setConfirmingId] = useState(null);

  if (isLoading) return <LoadingRows />;
  if (!events.length)
    return (
      <EmptyState
        message="Henüz etkinlik oluşturmadınız."
        action={{ to: ROUTES.EVENT_NEW, label: "İlk etkinliğini oluştur" }}
      />
    );

  return (
    <ul className="divide-y divide-gray-100">
      {events.map((event) => {
        const isThisDeleting = isDeleting && deletingId === event.id;
        const isConfirming = confirmingId === event.id;

        return (
          <li key={event.id} className="flex items-start justify-between py-3 gap-4">
            <div className="min-w-0">
              <Link
                to={`/events/${event.id}`}
                className="text-sm font-medium text-gray-900 hover:underline truncate block"
              >
                {event.title}
              </Link>
              <p className="text-xs text-gray-500 mt-0.5">
                {formatEventDate(event.startsAt, { timeTbd: event.timeTbd })}
              </p>
              {event.status === "rejected" && event.rejectionReason && (
                <p className="mt-1 text-xs text-zinc-500 italic">
                  Gerekçe: {event.rejectionReason}
                </p>
              )}
            </div>

            <div className="flex shrink-0 items-center gap-2">
              {isConfirming ? (
                <>
                  <span className="text-xs text-zinc-600">Silinsin mi?</span>
                  <button
                    type="button"
                    onClick={() => { deleteEvent(event.id); setConfirmingId(null); }}
                    disabled={isThisDeleting}
                    className="rounded-md bg-red-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-red-700 transition disabled:opacity-50"
                  >
                    Evet, sil
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmingId(null)}
                    className="rounded-md border border-gray-300 px-2.5 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50 transition"
                  >
                    İptal
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to={`/events/${event.id}/edit`}
                    className="rounded-md border border-gray-300 px-2.5 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50 transition"
                  >
                    Düzenle
                  </Link>
                  <button
                    type="button"
                    onClick={() => setConfirmingId(event.id)}
                    disabled={isThisDeleting}
                    className="rounded-md border border-red-200 px-2.5 py-1 text-xs font-medium text-red-600 hover:bg-red-50 transition disabled:opacity-50"
                  >
                    {isThisDeleting ? "Siliniyor…" : "Sil"}
                  </button>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      STATUS_BADGE[event.status] ?? "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {STATUS_LABEL[event.status] ?? event.status}
                  </span>
                </>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
}

function FavoritesTab() {
  const { data: events = [], isLoading } = useUserFavoriteEvents();

  if (isLoading) return <LoadingRows />;
  if (!events.length)
    return (
      <EmptyState
        message="Henüz favori etkinliğiniz yok."
        action={{ to: ROUTES.EVENTS, label: "Etkinliklere göz at" }}
      />
    );

  const upcoming = events.filter((e) => !isPast(e));
  const past = events.filter((e) => isPast(e));

  return (
    <div className="space-y-6">
      {upcoming.length > 0 ? (
        <EventRows events={upcoming} />
      ) : (
        <p className="text-sm text-zinc-400">Yaklaşan favori etkinlik yok.</p>
      )}
      {past.length > 0 && (
        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-wider text-zinc-400">Geçmiş</p>
          <ul className="divide-y divide-gray-100">
            {past.map((event) => (
              <li key={event.id} className="py-3">
                <Link
                  to={`/events/${event.id}`}
                  className="block text-sm font-medium text-zinc-400 hover:underline"
                >
                  {event.title}
                </Link>
                <p className="mt-0.5 text-xs text-zinc-300">
                  {formatEventDate(event.startsAt, { timeTbd: event.timeTbd })}
                </p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function JoinedTab() {
  const { data: events = [], isLoading } = useUserJoinedEvents();

  if (isLoading) return <LoadingRows />;
  if (!events.length)
    return (
      <EmptyState
        message="Henüz hiçbir etkinliğe katılmadınız."
        action={{ to: ROUTES.EVENTS, label: "Etkinliklere göz at" }}
      />
    );

  const upcoming = events.filter((e) => !isPast(e));
  const past = events.filter((e) => isPast(e));

  return (
    <div className="space-y-6">
      {upcoming.length > 0 ? (
        <ul className="divide-y divide-gray-100">
          {upcoming.map((event) => (
            <JoinedEventRow key={event.id} event={event} />
          ))}
        </ul>
      ) : (
        <p className="text-sm text-zinc-400">Yaklaşan etkinlik yok.</p>
      )}
      {past.length > 0 && (
        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-wider text-zinc-400">Geçmiş</p>
          <ul className="divide-y divide-gray-100">
            {past.map((event) => (
              <li key={event.id} className="py-3">
                <Link
                  to={`/events/${event.id}`}
                  className="block truncate text-sm font-medium text-zinc-400 hover:underline"
                >
                  {event.title}
                </Link>
                <p className="mt-0.5 text-xs text-zinc-300">
                  {formatEventDate(event.startsAt, { timeTbd: event.timeTbd })}
                </p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function JoinedEventRow({ event }) {
  const { mutate, isPending } = useLeaveEvent(event.id);

  return (
    <li className="flex items-center justify-between gap-4 py-3">
      <div className="min-w-0">
        <Link
          to={`/events/${event.id}`}
          className="text-sm font-medium text-gray-900 hover:underline truncate block"
        >
          {event.title}
        </Link>
        <p className="text-xs text-gray-500 mt-0.5">
          {formatEventDate(event.startsAt)}
        </p>
      </div>
      <button
        type="button"
        onClick={() => mutate()}
        disabled={isPending}
        className="shrink-0 rounded-md border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 transition disabled:opacity-50"
      >
        Ayrıl
      </button>
    </li>
  );
}

function EventRows({ events }) {
  return (
    <ul className="divide-y divide-gray-100">
      {events.map((event) => (
        <li key={event.id} className="py-3">
          <Link
            to={`/events/${event.id}`}
            className="text-sm font-medium text-gray-900 hover:underline block"
          >
            {event.title}
          </Link>
          <p className="text-xs text-gray-500 mt-0.5">
            {formatEventDate(event.startsAt)}
          </p>
        </li>
      ))}
    </ul>
  );
}

function LoadingRows() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-10 rounded bg-gray-100 animate-pulse" />
      ))}
    </div>
  );
}

function EmptyState({ message, action }) {
  return (
    <div className="py-10 text-center">
      <p className="text-sm text-gray-500">{message}</p>
      {action && (
        <Link
          to={action.to}
          className="mt-3 inline-block text-sm font-medium text-gray-900 underline"
        >
          {action.label}
        </Link>
      )}
    </div>
  );
}
