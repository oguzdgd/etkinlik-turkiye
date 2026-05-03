import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@features/auth/hooks/useAuth";
import Spinner from "@components/ui/Spinner";

export default function ProtectedRoute() {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) return <Spinner />;

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}
