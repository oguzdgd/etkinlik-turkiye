import { Link, NavLink } from "react-router-dom";
import { LogoutButton, useAuth } from "@features/auth";
import { ROLES } from "@lib/constants";

const linkClass = ({ isActive }) =>
  [
    "rounded px-3 py-1.5 text-sm transition-colors",
    isActive ? "font-semibold text-gray-900" : "text-gray-600 hover:text-gray-900",
  ].join(" ");

export default function Navbar() {
  const { user, role } = useAuth();

  // Build the nav based on the current auth state — no flicker because
  // AuthProvider blocks initial render until auth is resolved.
  const items = [
    { to: "/", label: "Ana Sayfa", end: true },
    { to: "/events", label: "Etkinlikler" },
    { to: "/events/map", label: "Harita" },
    user && { to: "/events/new", label: "Etkinlik Oluştur" },
    user && { to: "/dashboard", label: "Panelim" },
    user && role === ROLES.ADMIN && { to: "/admin", label: "Admin" },
  ].filter(Boolean);

  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <Link to="/" className="text-lg font-bold tracking-tight">
          Etkinlik Türkiye
        </Link>

        <nav className="flex items-center gap-1" aria-label="Ana menü">
          {items.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end} className={linkClass}>
              {item.label}
            </NavLink>
          ))}

          {user ? (
            <div className="ml-2 flex items-center gap-2 border-l border-gray-200 pl-2">
              <span className="hidden text-sm text-gray-600 sm:inline">
                {user.displayName || user.email}
              </span>
              <LogoutButton />
            </div>
          ) : (
            <NavLink to="/login" className={linkClass}>
              Giriş
            </NavLink>
          )}
        </nav>
      </div>
    </header>
  );
}
