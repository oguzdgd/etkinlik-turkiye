import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useEventsForCalendar } from "@features/events";
import Spinner from "@components/ui/Spinner";
import { usePageTitle } from "@hooks/usePageTitle";

const TR_MONTHS = ["Oca","Şub","Mar","Nis","May","Haz","Tem","Ağu","Eyl","Eki","Kas","Ara"];
const TR_MONTHS_FULL = ["Ocak","Şubat","Mart","Nisan","Mayıs","Haziran","Temmuz","Ağustos","Eylül","Ekim","Kasım","Aralık"];
const DOW = ["Pzt","Sal","Çar","Per","Cum","Cmt","Paz"];

const pad2 = (n) => String(n).padStart(2, "0");

function toISO(year, month, day) {
  return `${year}-${pad2(month + 1)}-${pad2(day)}`;
}

function fmtTime(isoStr) {
  if (!isoStr) return "";
  return new Date(isoStr).toLocaleTimeString("tr-TR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function CalendarPage() {
  usePageTitle("Takvim");
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [selected, setSelected] = useState(toISO(today.getFullYear(), today.getMonth(), today.getDate()));

  const { data: events = [], isLoading } = useEventsForCalendar(year, month);

  const eventsByDate = useMemo(() => {
    const m = {};
    events.forEach((e) => {
      const date = e.startsAt?.slice(0, 10);
      if (date) (m[date] ??= []).push(e);
    });
    return m;
  }, [events]);

  // Build calendar grid (Mon-first) — only when year/month changes, not on day selection
  const cells = useMemo(() => {
    const firstDow = (new Date(year, month, 1).getDay() + 6) % 7;
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const arr = [
      ...Array(firstDow).fill(null),
      ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
    ];
    while (arr.length % 7 !== 0) arr.push(null);
    return arr;
  }, [year, month]);

  function prevMonth() {
    if (month === 0) { setYear((y) => y - 1); setMonth(11); }
    else setMonth((m) => m - 1);
  }
  function nextMonth() {
    if (month === 11) { setYear((y) => y + 1); setMonth(0); }
    else setMonth((m) => m + 1);
  }

  const selectedEvents = eventsByDate[selected] ?? [];
  const todayISO = toISO(today.getFullYear(), today.getMonth(), today.getDate());

  return (
    <>
      {/* Page header */}
      <div className="mb-10 border-b border-zinc-200 pb-10">
        <div className="mb-3 font-mono text-[11px] uppercase tracking-[0.18em] text-zinc-500">
          ↳ {TR_MONTHS_FULL[month]} {year}
        </div>
        <div className="grid grid-cols-12 items-end gap-4">
          <h1 className="display-tight col-span-12 text-[56px] font-light leading-[0.92] text-zinc-900 md:col-span-8 md:text-[80px]">
            Takvim<span className="text-zinc-400">.</span>
          </h1>
          <div className="col-span-12 md:col-span-4 md:justify-self-end">
            <div className="tabular display-tight text-[44px] font-light text-zinc-900">
              {isLoading ? "—" : events.length}
            </div>
            <div className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-zinc-500">
              bu ay
            </div>
          </div>
        </div>
        <p className="mt-6 max-w-2xl text-[16px] leading-relaxed text-zinc-600">
          Bu ayın yazılım, AI ve hackathon etkinlikleri. Bir gün seçin, etkinlikler
          sağda görünecek.
        </p>
      </div>

      <div className="grid grid-cols-12 gap-8">
        {/* Calendar */}
        <div className="col-span-12 lg:col-span-8">
          {/* Month nav */}
          <div className="mb-6 flex items-center justify-between">
            <div>
              <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-zinc-500">Ay</div>
              <div className="mt-1 text-[22px] font-light tracking-tight text-zinc-900">
                {TR_MONTHS_FULL[month]} {year}
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={prevMonth}
                className="focus-ring grid h-9 w-9 place-items-center rounded-lg border border-zinc-200 text-zinc-700 transition-colors hover:border-zinc-400"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="m15 19-7-7 7-7" />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => { setYear(today.getFullYear()); setMonth(today.getMonth()); setSelected(todayISO); }}
                className="focus-ring h-9 rounded-lg border border-zinc-200 px-3 text-[12.5px] font-medium text-zinc-700 transition-colors hover:border-zinc-400"
              >
                Bugün
              </button>
              <button
                type="button"
                onClick={nextMonth}
                className="focus-ring grid h-9 w-9 place-items-center rounded-lg border border-zinc-200 text-zinc-700 transition-colors hover:border-zinc-400"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="m9 5 7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>

          {/* Grid */}
          <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white">
            {/* DOW header */}
            <div className="grid grid-cols-7 border-b border-zinc-200 bg-zinc-50">
              {DOW.map((d) => (
                <div key={d} className="py-2.5 text-center font-mono text-[10.5px] uppercase tracking-[0.18em] text-zinc-500">
                  {d}
                </div>
              ))}
            </div>

            {isLoading ? (
              <div className="py-20 grid place-items-center">
                <Spinner />
              </div>
            ) : (
              <div className="grid grid-cols-7">
                {cells.map((day, i) => {
                  if (day === null) {
                    return (
                      <div
                        key={i}
                        className="aspect-square border-b border-r border-zinc-100 bg-zinc-50/40"
                      />
                    );
                  }
                  const iso = toISO(year, month, day);
                  const dayEvents = eventsByDate[iso] ?? [];
                  const isSel = selected === iso;
                  const isToday = iso === todayISO;
                  const isWeekend = i % 7 >= 5;

                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setSelected(iso)}
                      className={`aspect-square border-b border-r border-zinc-100 p-2 text-left transition-colors focus-ring
                        ${isSel ? "bg-black text-white" : "bg-white hover:bg-zinc-50"}`}
                    >
                      <div className={`flex items-center justify-between text-[13px] tabular
                        ${isSel ? "text-white" : isToday ? "font-bold text-zinc-900" : isWeekend ? "text-zinc-400" : "text-zinc-900"}`}>
                        <span>{day}</span>
                        {dayEvents.length > 0 && (
                          <span className={`font-mono text-[10px] tabular ${isSel ? "text-white" : "text-zinc-500"}`}>
                            ×{dayEvents.length}
                          </span>
                        )}
                      </div>
                      {dayEvents.length > 0 && (
                        <div className="mt-1.5 flex flex-wrap gap-1">
                          {dayEvents.slice(0, 4).map((e) => (
                            <span key={e.id} className={`h-1.5 w-1.5 rounded-full ${isSel ? "bg-white/80" : "bg-zinc-900"}`} />
                          ))}
                        </div>
                      )}
                      {dayEvents.length > 0 && (
                        <div className={`mt-1 hidden truncate text-[10.5px] sm:block ${isSel ? "text-white/80" : "text-zinc-500"}`}>
                          {dayEvents[0].title}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Legend */}
          <div className="mt-4 flex items-center gap-5 font-mono text-[11px] uppercase tracking-[0.16em] text-zinc-500">
            <span className="inline-flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-zinc-900" />
              Etkinlik
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-sm bg-black" />
              Seçili gün
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-sm border border-zinc-300" />
              Bugün
            </span>
          </div>
        </div>

        {/* Day panel */}
        <div className="col-span-12 lg:col-span-4">
          <div className="sticky top-24">
            <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-zinc-500">
              Seçili gün
            </div>
            <div className="mt-1 leading-none">
              <span className="display-tight text-[48px] font-light text-zinc-900">
                {Number(selected.slice(8))}
              </span>
              <span className="ml-2 text-[18px] font-normal tracking-tight text-zinc-500">
                {TR_MONTHS[Number(selected.slice(5, 7)) - 1]}
              </span>
            </div>
            <div className="mt-1 text-[13px] text-zinc-500">
              {selectedEvents.length} etkinlik
            </div>

            <div className="mt-6 space-y-3">
              {selectedEvents.length === 0 ? (
                <div className="rounded-xl border border-dashed border-zinc-300 p-6 text-center text-[13px] text-zinc-500">
                  Bu gün için etkinlik yok.
                </div>
              ) : (
                selectedEvents.map((e) => (
                  <Link
                    key={e.id}
                    to={`/events/${e.id}`}
                    className="card-hover shadow-card block rounded-xl border border-zinc-200 bg-white p-4 focus-ring"
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <span className="inline-flex h-5 items-center rounded-full border border-zinc-200 px-2 font-mono text-[10px] uppercase tracking-[0.14em] text-zinc-700">
                        {e.category}
                      </span>
                      <span className="tabular font-mono text-[11px] text-zinc-500">
                        {fmtTime(e.startsAt)}
                      </span>
                    </div>
                    <div className="clamp-2 text-[14px] font-medium leading-snug text-zinc-900">
                      {e.title}
                    </div>
                    <div className="mt-2 flex items-center gap-1.5 text-[12px] text-zinc-500">
                      {e.type === "online" ? (
                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <circle cx="12" cy="12" r="9" />
                          <path d="M3 12h18M12 3c2.5 3 2.5 15 0 18M12 3c-2.5 3-2.5 15 0 18" />
                        </svg>
                      ) : (
                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path d="M12 21s-7-6.2-7-12a7 7 0 0 1 14 0c0 5.8-7 12-7 12Z" />
                          <circle cx="12" cy="9" r="2.5" />
                        </svg>
                      )}
                      <span>{e.type === "online" ? "Online" : e.city}</span>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
