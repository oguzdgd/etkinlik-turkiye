import { Link } from "react-router-dom";
import { usePageTitle } from "@hooks/usePageTitle";

const CITIES = [
  { name: "İstanbul",  code: "İST", region: "Marmara",      note: "AI, startup ve fintech merkezi" },
  { name: "Ankara",    code: "ANK", region: "İç Anadolu",    note: "ODTÜ, Bilkent, kamu teknoloji" },
  { name: "İzmir",     code: "İZM", region: "Ege",           note: "DevOps & veri toplulukları" },
  { name: "Bursa",     code: "BUR", region: "Marmara",       note: "Üniversite hackathonları" },
  { name: "Antalya",   code: "AYT", region: "Akdeniz",       note: "Mobil & oyun konferansları" },
  { name: "Eskişehir", code: "ESK", region: "İç Anadolu",    note: "Anadolu Teknopark merkezli" },
  { name: "Online",    code: "ONL", region: "Uzaktan",       note: "Discord, Zoom, Twitch" },
];

const pad2 = (n) => String(n).padStart(2, "0");

export default function CitiesPage() {
  usePageTitle("Şehirler");
  return (
    <>
      {/* Page header */}
      <div className="mb-10 border-b border-zinc-200 pb-10">
        <div className="mb-3 font-mono text-[11px] uppercase tracking-[0.18em] text-zinc-500">
          ↳ Türkiye'de
        </div>
        <div className="grid grid-cols-12 items-end gap-4">
          <h1 className="display-tight col-span-12 text-[56px] font-light leading-[0.92] text-zinc-900 md:col-span-8 md:text-[80px]">
            Şehirler<span className="text-zinc-400">.</span>
          </h1>
          <div className="col-span-12 md:col-span-4 md:justify-self-end">
            <div className="tabular display-tight text-[44px] font-light text-zinc-900">
              {CITIES.length}
            </div>
            <div className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-zinc-500">
              aktif şehir
            </div>
          </div>
        </div>
        <p className="mt-6 max-w-2xl text-[16px] leading-relaxed text-zinc-600">
          Etkinlikler şehre göre — yerelinizdeki yazılım ve AI buluşmalarını keşfedin,
          ya da uzaktan katılın.
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {CITIES.map((city, i) => {
          const isOnline = city.name === "Online";
          const to = isOnline ? "/?type=online" : `/?city=${encodeURIComponent(city.name)}`;

          return (
            <Link
              key={city.name}
              to={to}
              className="card-hover shadow-card group overflow-hidden rounded-2xl border border-zinc-200 bg-white focus-ring"
            >
              {/* Cover with code */}
              <div
                className={`relative grid h-32 place-items-center text-center
                  ${isOnline ? "stripe-placeholder-dark text-white" : "stripe-placeholder text-zinc-700"}`}
              >
                <div>
                  <div className="font-mono text-[10px] uppercase tracking-[0.22em] opacity-70">
                    {city.region}
                  </div>
                  <div className="display-tight mt-1 text-[44px] font-light leading-none">
                    {city.code}
                  </div>
                </div>
                <span className="absolute left-3 top-3 font-mono text-[10px] uppercase tracking-[0.18em] opacity-50">
                  {pad2(i + 1)}
                </span>
              </div>

              {/* Body */}
              <div className="p-5">
                <div className="flex items-baseline justify-between">
                  <h3 className="text-[20px] font-medium tracking-tight text-zinc-900">
                    {city.name}
                  </h3>
                </div>
                <p className="mt-1 text-[12.5px] text-zinc-500">{city.note}</p>
                <div className="mt-4 border-t border-zinc-100 pt-3">
                  <span className="inline-flex items-center gap-1 text-[12px] font-medium text-zinc-900 opacity-50 transition-opacity group-hover:opacity-100">
                    Etkinlikleri gör
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M13 6l6 6-6 6" />
                    </svg>
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </>
  );
}
