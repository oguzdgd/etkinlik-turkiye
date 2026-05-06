import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@features/auth";
import { useUserEvents, useUserJoinedEvents, useLeaveEvent } from "@features/events";
import { useUserFavoriteEvents } from "@features/favorites";
import { EVENT_STATUS, ROUTES } from "@lib/constants";
import { formatEventDate } from "@features/events/lib/format";

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

  return (
    <section className="space-y-6">
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
      {events.map((event) => (
        <li key={event.id} className="flex items-center justify-between py-3 gap-4">
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
          <span
            className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${
              STATUS_BADGE[event.status] ?? "bg-gray-100 text-gray-700"
            }`}
          >
            {STATUS_LABEL[event.status] ?? event.status}
          </span>
        </li>
      ))}
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

  return <EventRows events={events} />;
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

  return (
    <ul className="divide-y divide-gray-100">
      {events.map((event) => (
        <JoinedEventRow key={event.id} event={event} />
      ))}
    </ul>
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
