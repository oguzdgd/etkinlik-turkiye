import { EventCreateForm } from "@features/events";

export default function EventCreatePage() {
  return (
    <div className="mx-auto max-w-2xl">
      <header className="mb-6 space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">Etkinlik Oluştur</h1>
        <p className="text-sm text-gray-600">
          Etkinliğin admin onayından sonra herkese görünür olur.
        </p>
      </header>
      <EventCreateForm />
    </div>
  );
}
