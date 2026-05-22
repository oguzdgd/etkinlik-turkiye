import { Link } from "react-router-dom";
import { EVENT_CATEGORIES, slugify } from "@lib/constants";
import { usePageTitle } from "@hooks/usePageTitle";

const CATEGORY_META = {
  Hackathon:   { blurb: "48 saatte sıfırdan ürün kurmak." },
  AI:          { blurb: "Üretken modeller, LLM mühendisliği, araştırma." },
  Yazılım:     { blurb: "React, Next, Rust, backend mimarileri." },
  Workshop:    { blurb: "Pratik, küçük gruplu, uygulamalı oturumlar." },
  Kariyer:     { blurb: "CV klinikleri, mentörlük, iş fırsatları." },
  Networking:  { blurb: "Geliştirici buluşmaları, topluluk geceleri." },
  Diğer:       { blurb: "Kategoriye girmeyen her şey buraya gelir." },
};

const pad2 = (n) => String(n).padStart(2, "0");

export default function CategoriesPage() {
  usePageTitle("Kategoriler");
  return (
    <>
      {/* Page header */}
      <div className="mb-10 border-b border-zinc-200 pb-10">
        <div className="mb-3 font-mono text-[11px] uppercase tracking-[0.18em] text-zinc-500">
          ↳ A–Z
        </div>
        <div className="grid grid-cols-12 items-end gap-4">
          <h1 className="display-tight col-span-12 text-[56px] font-light leading-[0.92] text-zinc-900 md:col-span-8 md:text-[80px]">
            Kategoriler<span className="text-zinc-400">.</span>
          </h1>
          <div className="col-span-12 md:col-span-4 md:justify-self-end">
            <div className="tabular display-tight text-[44px] font-light text-zinc-900">
              {EVENT_CATEGORIES.length}
            </div>
            <div className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-zinc-500">
              kategori
            </div>
          </div>
        </div>
        <p className="mt-6 max-w-2xl text-[16px] leading-relaxed text-zinc-600">
          Her kategori, o alanda Türkiye'de yaklaşan etkinliklerin tam listesini içerir.
          Filtrelemek için seçin.
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 gap-px bg-zinc-200 overflow-hidden rounded-2xl border border-zinc-200 md:grid-cols-2 lg:grid-cols-3">
        {EVENT_CATEGORIES.map((cat, i) => {
          const meta = CATEGORY_META[cat] ?? { blurb: "" };
          return (
            <Link
              key={cat}
              to={`/categories/${slugify(cat)}`}
              className="group flex min-h-[200px] flex-col bg-white p-7 transition-colors hover:bg-zinc-50 focus-ring"
            >
              <div className="mb-6 flex items-start justify-between">
                <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-zinc-400">
                  {pad2(i + 1)}
                </span>
              </div>

              <h3 className="display-tight text-[26px] font-light text-zinc-900 leading-tight">
                {cat}
              </h3>
              <p className="mt-2 text-[13px] leading-relaxed text-zinc-500">
                {meta.blurb}
              </p>

              <div className="mt-auto pt-5">
                <span className="inline-flex items-center gap-1 text-[12px] font-medium text-zinc-900 opacity-50 transition-opacity group-hover:opacity-100">
                  Listeye git
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M13 6l6 6-6 6" />
                  </svg>
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </>
  );
}
