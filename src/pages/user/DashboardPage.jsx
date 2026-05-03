import { useAuth } from "@features/auth";

export default function DashboardPage() {
  const { user, role } = useAuth();

  return (
    <section className="space-y-3">
      <h1 className="text-2xl font-bold tracking-tight">Panelim</h1>
      <p className="text-gray-700">
        Hoş geldin, <strong>{user.displayName || user.email}</strong>.
      </p>
      <p className="text-sm text-gray-500">
        Rol: <span className="font-mono">{role}</span>
      </p>
    </section>
  );
}
