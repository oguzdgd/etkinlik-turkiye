import { PendingEventList } from "@features/events";

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">Admin Paneli</h1>
        <p className="text-sm text-gray-600">Onay bekleyen etkinlikler</p>
      </header>
      <PendingEventList />
    </div>
  );
}
