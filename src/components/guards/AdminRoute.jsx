import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@features/auth/hooks/useAuth";
import Spinner from "@components/ui/Spinner";
import { ROLES } from "@lib/constants";

export default function AdminRoute() {
  const { user, role, isLoading } = useAuth();

  if (isLoading) return <Spinner />;

  if (!user) return <Navigate to="/login" replace />;
  if (role !== ROLES.ADMIN) return <Navigate to="/" replace />;

  return <Outlet />;
}
