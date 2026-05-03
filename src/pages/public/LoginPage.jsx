import { Navigate } from "react-router-dom";
import { LoginForm, useAuth } from "@features/auth";

export default function LoginPage() {
  const { user } = useAuth();
  if (user) return <Navigate to="/" replace />;

  return (
    <div className="mx-auto max-w-sm">
      <h1 className="mb-6 text-2xl font-bold tracking-tight">Giriş Yap</h1>
      <LoginForm />
    </div>
  );
}
