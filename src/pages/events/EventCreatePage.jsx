import { useNavigate } from "react-router-dom";
import { EventCreateForm, useCreateEvent } from "@features/events";

export default function EventCreatePage() {
  const navigate = useNavigate();
  const { mutateAsync, isPending } = useCreateEvent();

  const handleSubmit = async (payload) => {
    await mutateAsync(payload);
    navigate("/dashboard?created=1");
  };

  return (
    <div className="mx-auto max-w-2xl">
      <header className="mb-6 space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">Etkinlik Oluştur</h1>
        <p className="text-sm text-zinc-500">
          Etkinliğin admin onayından sonra herkese görünür olur.
        </p>
      </header>
      <EventCreateForm onSubmit={handleSubmit} isPending={isPending} />
    </div>
  );
}
