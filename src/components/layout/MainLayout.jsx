import { Suspense } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Spinner from "@components/ui/Spinner";

export default function MainLayout() {
  return (
    <div className="flex min-h-full flex-col overflow-x-hidden bg-zinc-50 text-zinc-900">
      <Navbar />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">
        <Suspense fallback={<Spinner />}>
          <Outlet />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}

function Footer() {
  return (
    <footer className="border-t border-zinc-200 bg-white">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid grid-cols-2 gap-8 py-10 md:grid-cols-4">
          <div className="col-span-2 md:col-span-1">
            <div className="mb-3 flex items-center gap-2">
              <span className="grid h-6 w-6 place-items-center rounded bg-black font-mono text-[10px] text-white">
                ET
              </span>
              <span className="text-[14px] font-medium tracking-tight text-zinc-900">
                Etkinlik Türkiye
              </span>
            </div>
            <p className="text-[12.5px] leading-relaxed text-zinc-500">
              Türkiye'nin etkinlik haritası. Her hafta seçilmiş, gürültüsüz.
            </p>
          </div>
          {[
            ["Keşfet", ["Bu hafta", "Harita", "Etkinlik Oluştur"]],
            ["Hesap", ["Giriş yap", "Kayıt ol", "Panelim"]],
            ["Şirket", ["Hakkımızda", "İletişim"]],
          ].map(([heading, items]) => (
            <div key={heading}>
              <div className="mb-3 font-mono text-[10.5px] uppercase tracking-[0.18em] text-zinc-500">
                {heading}
              </div>
              <ul className="space-y-1.5">
                {items.map((item) => (
                  <li key={item}>
                    <a href="#" className="text-[13px] text-zinc-600 hover:text-zinc-900">
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between border-t border-zinc-200 py-4 text-[12px] text-zinc-400">
          <span>© 2026 Etkinlik Türkiye</span>
          <span className="font-mono tracking-[0.16em] uppercase">İST · ANK · İZM</span>
        </div>
      </div>
    </footer>
  );
}
