import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@features/auth";
import { EventCreateForm, useEventDetail, useUpdateEvent } from "@features/events";

export default function EventEditPage() {
  const { eventId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: event, isLoading } = useEventDetail(eventId);
  const { mutateAsync, isPending } = useUpdateEvent();

  if (isLoading) return <EditSkeleton />;

  if (!event) return null;

  if (event.createdBy !== user?.uid) {
    navigate("/", { replace: true });
    return null;
  }

  const handleSubmit = async (payload) => {
    await mutateAsync({
      eventId,
      existingLat: event.lat,
      existingLng: event.lng,
      existingImageURL: event.imageURL,
      ...payload,
    });
    navigate("/dashboard?updated=1");
  };

  return (
    <div className="mx-auto max-w-2xl">
      <header className="mb-6 space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">Etkinliği Düzenle</h1>
        <p className="text-sm text-zinc-500">
          Değişiklikler yeniden admin onayına gönderilecek.
        </p>
      </header>
      <EventCreateForm
        initialValues={event}
        onSubmit={handleSubmit}
        isPending={isPending}
        submitLabel="Güncelle ve onaya gönder"
      />
    </div>
  );
}

function EditSkeleton() {
  return (
    <div className="mx-auto max-w-2xl animate-pulse space-y-5">
      <div className="h-8 w-48 rounded bg-zinc-100" />
      <div className="h-12 rounded-xl bg-zinc-100" />
      <div className="h-36 rounded-xl bg-zinc-100" />
      <div className="grid grid-cols-2 gap-5">
        <div className="h-12 rounded-xl bg-zinc-100" />
        <div className="h-12 rounded-xl bg-zinc-100" />
      </div>
      <div className="h-12 rounded-xl bg-zinc-100" />
    </div>
  );
}
