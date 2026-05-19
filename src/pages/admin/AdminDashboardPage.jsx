import { PendingEventList } from "@features/events";
import { usePageTitle } from "@hooks/usePageTitle";

export default function AdminDashboardPage() {
  usePageTitle("Admin Paneli");

  return (
    <div className="space-y-8">
      <div className="border-b border-zinc-200 pb-8">
        <div className="mb-2 font-mono text-[11px] uppercase tracking-[0.18em] text-zinc-500">
          ↳ Moderasyon
        </div>
        <h1 className="display-tight text-[40px] font-light text-zinc-900">
          Admin Paneli<span className="text-zinc-400">.</span>
        </h1>
        <p className="mt-2 text-[14px] text-zinc-500">Onay bekleyen etkinlikler</p>
      </div>
      <PendingEventList />
    </div>
  );
}
