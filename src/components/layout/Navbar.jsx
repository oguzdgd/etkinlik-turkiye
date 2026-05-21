import { useState, useRef, useEffect } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { useAuth, useLogout } from "@features/auth";
import { ROLES, ROUTES } from "@lib/constants";

export default function Navbar() {
  const { user, role } = useAuth();
  const { mutate: logout } = useLogout();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const dropdownRef = useRef(null);
  const location = useLocation();

  // Close everything on navigation
  useEffect(() => {
    setDropdownOpen(false);
    setMobileOpen(false);
  }, [location.pathname]);

  // Close user dropdown on outside click
  useEffect(() => {
    const onDoc = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const initials = user
    ? (user.displayName || user.email || "?")
        .split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase()
    : "";

  return (
    <header className="sticky top-0 z-40 bg-white/80 nav-blur border-b border-zinc-200">
      {/* Main bar */}
      <div className="mx-auto flex h-[72px] w-full max-w-7xl items-center justify-between px-4 sm:px-8">

        {/* Left: logo + desktop nav */}
        <div className="flex items-center gap-8">
          <Link to="/" className="focus-ring inline-flex items-center gap-2.5 rounded-md">
            <span className="grid h-8 w-8 place-items-center rounded-md bg-black text-white">
              <span className="font-mono text-[12px] font-medium">ET</span>
            </span>
            <span className="flex items-baseline gap-1.5">
              <span className="text-[17px] font-semibold tracking-tight text-zinc-900">Etkinlik</span>
              <span className="text-[17px] font-light tracking-tight text-zinc-500">Türkiye</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            <NavItem to="/">Keşfet</NavItem>
            <NavItem to="/categories">Kategoriler</NavItem>
            <NavItem to="/cities">Şehirler</NavItem>
            <NavItem to="/calendar">Takvim</NavItem>
            <NavItem to="/events/map">Harita</NavItem>
          </nav>
        </div>

        {/* Right: auth + hamburger */}
        <div className="flex items-center gap-2">
          {/* Desktop auth */}
          {!user ? (
            <div className="hidden items-center gap-2 sm:flex">
              <NavLink
                to={ROUTES.LOGIN}
                className="focus-ring inline-flex h-10 items-center rounded-lg border border-zinc-300 px-5 text-[14.5px] font-medium text-zinc-900 transition-colors hover:border-zinc-400 hover:bg-zinc-50"
              >
                Giriş yap
              </NavLink>
              <NavLink
                to={ROUTES.REGISTER}
                className="focus-ring inline-flex h-10 items-center rounded-lg bg-black px-5 text-[14.5px] font-medium text-white transition-colors hover:bg-zinc-800"
              >
                Kayıt ol
              </NavLink>
            </div>
          ) : (
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setDropdownOpen((o) => !o)}
                className="focus-ring flex h-10 items-center gap-2.5 rounded-full pl-1 pr-3 transition-colors hover:bg-zinc-100"
                aria-expanded={dropdownOpen}
              >
                <span className="grid h-8 w-8 place-items-center rounded-full bg-zinc-900 text-[12px] font-medium tracking-wide text-white">
                  {initials}
                </span>
                <span className="hidden max-w-[140px] truncate text-[14.5px] font-medium text-zinc-900 sm:block">
                  {user.displayName || user.email?.split("@")[0]}
                </span>
                <svg
                  className={`h-4 w-4 text-zinc-500 transition-transform ${dropdownOpen ? "rotate-180" : ""}`}
                  fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="m6 9 6 6 6-6" />
                </svg>
              </button>

              {dropdownOpen && (
                <div className="shadow-lift absolute right-0 top-[3.25rem] w-68 overflow-hidden rounded-xl border border-zinc-200 bg-white">
                  <div className="border-b border-zinc-100 px-4 py-3.5">
                    <div className="text-[15px] font-medium text-zinc-900">
                      {user.displayName || "Kullanıcı"}
                    </div>
                    <div className="truncate text-[13px] text-zinc-500">{user.email}</div>
                  </div>
                  <div className="py-1">
                    <DropItem to={ROUTES.EVENT_NEW}>Etkinlik Oluştur</DropItem>
                    <DropItem to={ROUTES.DASHBOARD}>Panelim</DropItem>
                    <DropItem to={ROUTES.PROFILE}>Profilim</DropItem>
                    {role === ROLES.ADMIN && (
                      <DropItem to={ROUTES.ADMIN}>Admin Paneli</DropItem>
                    )}
                  </div>
                  <div className="border-t border-zinc-100 py-1">
                    <button
                      type="button"
                      onClick={() => logout()}
                      className="w-full px-4 py-2.5 text-left text-[14px] text-zinc-700 hover:bg-zinc-50"
                    >
                      Çıkış yap
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Mobile hamburger */}
          <button
            type="button"
            onClick={() => setMobileOpen((o) => !o)}
            aria-label={mobileOpen ? "Menüyü kapat" : "Menüyü aç"}
            aria-expanded={mobileOpen}
            className="focus-ring md:hidden grid h-9 w-9 place-items-center rounded-lg text-zinc-700 transition-colors hover:bg-zinc-100"
          >
            {mobileOpen ? (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu panel */}
      {mobileOpen && (
        <div className="md:hidden border-t border-zinc-200 bg-white">
          <nav className="px-4 py-3 space-y-0.5">
            <MobileNavItem to="/">Keşfet</MobileNavItem>
            <MobileNavItem to="/categories">Kategoriler</MobileNavItem>
            <MobileNavItem to="/cities">Şehirler</MobileNavItem>
            <MobileNavItem to="/calendar">Takvim</MobileNavItem>
            <MobileNavItem to="/events/map">Harita</MobileNavItem>
          </nav>

          {!user ? (
            <div className="border-t border-zinc-100 px-4 py-3 flex gap-2">
              <NavLink
                to={ROUTES.LOGIN}
                className="flex-1 text-center rounded-lg border border-zinc-300 py-2.5 text-[13.5px] font-medium text-zinc-900"
              >
                Giriş yap
              </NavLink>
              <NavLink
                to={ROUTES.REGISTER}
                className="flex-1 text-center rounded-lg bg-black py-2.5 text-[13.5px] font-medium text-white"
              >
                Kayıt ol
              </NavLink>
            </div>
          ) : (
            <div className="border-t border-zinc-100 px-4 py-3 space-y-0.5">
              <MobileNavItem to={ROUTES.EVENT_NEW}>Etkinlik Oluştur</MobileNavItem>
              <MobileNavItem to={ROUTES.DASHBOARD}>Panelim</MobileNavItem>
              <MobileNavItem to={ROUTES.PROFILE}>Profilim</MobileNavItem>
              {role === ROLES.ADMIN && (
                <MobileNavItem to={ROUTES.ADMIN}>Admin Paneli</MobileNavItem>
              )}
              <button
                type="button"
                onClick={() => logout()}
                className="w-full rounded-lg px-3 py-2.5 text-left text-[14px] text-zinc-700 hover:bg-zinc-50"
              >
                Çıkış yap
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
}

function NavItem({ to, children }) {
  return (
    <NavLink
      to={to}
      end
      className={({ isActive }) =>
        `focus-ring relative rounded px-3 py-2 text-[15px] tracking-tight transition-colors
         ${isActive ? "font-medium text-zinc-900" : "text-zinc-500 hover:text-zinc-900"}`
      }
    >
      {({ isActive }) => (
        <>
          {children}
          {isActive && (
            <span className="absolute -bottom-[21px] left-3 right-3 h-px bg-black" />
          )}
        </>
      )}
    </NavLink>
  );
}

function MobileNavItem({ to, children }) {
  return (
    <NavLink
      to={to}
      end
      className={({ isActive }) =>
        `block rounded-lg px-3 py-3 text-[15px] transition-colors
         ${isActive ? "bg-zinc-100 font-medium text-zinc-900" : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900"}`
      }
    >
      {children}
    </NavLink>
  );
}

function DropItem({ to, children }) {
  return (
    <NavLink
      to={to}
      className="flex items-center px-4 py-2.5 text-[14px] text-zinc-700 hover:bg-zinc-50"
    >
      {children}
    </NavLink>
  );
}
