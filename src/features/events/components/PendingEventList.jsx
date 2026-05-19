import Spinner from "@components/ui/Spinner";
import { usePendingEvents } from "../hooks/usePendingEvents";
import PendingEventRow from "./PendingEventRow";

export default function PendingEventList() {
  const { data, isLoading, isError, error } = usePendingEvents();

  if (isLoading) return <Spinner />;
  if (isError) {
    return (
      <p className="text-sm text-red-600">
        Bekleyen etkinlikler yüklenemedi: {error.message}
      </p>
    );
  }
  if (!data || data.length === 0) {
    return (
      <div className="grid place-items-center rounded-2xl border border-dashed border-zinc-300 py-16 text-center">
        <p className="text-[14px] text-zinc-500">Onay bekleyen etkinlik yok.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {data.map((event) => (
        <PendingEventRow key={event.id} event={event} />
      ))}
    </div>
  );
}
