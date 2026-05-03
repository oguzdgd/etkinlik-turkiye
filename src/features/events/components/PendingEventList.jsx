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
    return <p className="text-sm text-gray-600">Onay bekleyen etkinlik yok.</p>;
  }

  return (
    <div className="space-y-3">
      {data.map((event) => (
        <PendingEventRow key={event.id} event={event} />
      ))}
    </div>
  );
}
