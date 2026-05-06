import { useState, useRef, useEffect } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { useAuth, useLogout } from "@features/auth";
import { ROLES, ROUTES } from "@lib/constants";

const navLinkClass = ({ isActive }) =>
  [
    "rounded px-3 py-1.5 text-sm transition-colors",
    isActive ? "font-semibold text-gray-900" : "text-gray-600 hover:text-gray-900",
  ].join(" ");

export default function Navbar() {
  const { user, role } = useAuth();
  const { mutate: logout } = useLogout();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const location = useLocation();

  // Rota değişince dropdown kapansın
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  // Dışarı tıklayınca kapat
  useEffect(() => {
    function handleClick(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function handleKeyDown(e) {
    if (e.key === "Escape") setIsOpen(false);
  }

  const initials = user
    ? (user.displayName || user.email || "?")
        .split(" ")
        .map((w) => w[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "";

  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        {/* Sol */}
        <div className="flex items-center gap-1">
          <Link
            to="/"
            className="mr-2 text-lg font-bold tracking-tight text-gray-900"
          >
            Etkinlik Türkiye
          </Link>
          <NavLink to="/events/map" className={navLinkClass}>
            Harita
          </NavLink>
        </div>

        {/* Sağ */}
        <nav aria-label="Kullanıcı menüsü">
          {user ? (
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setIsOpen((o) => !o)}
                onKeyDown={handleKeyDown}
                className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100 transition"
                aria-expanded={isOpen}
                aria-haspopup="true"
              >
                <span className="hidden sm:inline">
                  {user.displayName || user.email}
                </span>
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-900 text-xs font-semibold text-white sm:hidden">
                  {initials}
                </span>
                <svg
                  className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {isOpen && (
                <div className="absolute right-0 top-full z-50 mt-1 w-48 rounded-md border border-gray-200 bg-white py-1 shadow-lg">
                  <DropdownLink to={ROUTES.EVENT_NEW}>Etkinlik Oluştur</DropdownLink>
                  <DropdownLink to={ROUTES.DASHBOARD}>Panelim</DropdownLink>
                  <DropdownLink to={ROUTES.PROFILE}>Profilim</DropdownLink>
                  {role === ROLES.ADMIN && (
                    <DropdownLink to={ROUTES.ADMIN}>Admin Paneli</DropdownLink>
                  )}
                  <hr className="my-1 border-gray-100" />
                  <button
                    type="button"
                    onClick={() => logout()}
                    className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-50"
                  >
                    Çıkış yap
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <NavLink
                to={ROUTES.LOGIN}
                className="rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
              >
                Giriş yap
              </NavLink>
              <NavLink
                to={ROUTES.REGISTER}
                className="rounded-md bg-gray-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-gray-700 transition"
              >
                Kayıt ol
              </NavLink>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}

function DropdownLink({ to, children }) {
  return (
    <NavLink
      to={to}
      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
    >
      {children}
    </NavLink>
  );
}
