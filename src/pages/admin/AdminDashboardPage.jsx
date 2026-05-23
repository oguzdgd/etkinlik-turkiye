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

      {/* Moderasyon kriterleri */}
      <div className="rounded-xl border border-zinc-200 bg-zinc-50 px-5 py-4">
        <div className="mb-2 font-mono text-[10.5px] uppercase tracking-[0.18em] text-zinc-500">
          Kabul kriterleri
        </div>
        <p className="text-[13px] leading-relaxed text-zinc-600">
          Teknik bir beceri kazandıran veya yazılım/teknoloji kariyerine katkı sağlayan etkinlikler kabul edilir.
        </p>
        <ul className="mt-3 space-y-1 text-[13px] text-zinc-600">
          <li className="flex items-start gap-2">
            <span className="mt-0.5 text-zinc-400">✓</span>
            Hackathon, konferans, meetup, workshop, bootcamp, staj, yarışma, AI etkinlikleri
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-0.5 text-zinc-400">✗</span>
            Finans, pazarlama, genel kültür eğitimleri — yazılım/teknoloji odağı olmayan her şey
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-0.5 text-zinc-400">✗</span>
            Konser, spor, sosyal etkinlikler
          </li>
        </ul>
      </div>

      <PendingEventList />
    </div>
  );
}
