import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useLogin } from "../hooks/useLogin";
import { safeRedirectPath } from "../lib/safeRedirect";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();
  const location = useLocation();
  const { mutateAsync, isPending, error } = useLogin();

  const redirectTo = safeRedirectPath(location.state?.from?.pathname, "/");

  async function onSubmit(e) {
    e.preventDefault();
    try {
      await mutateAsync({ email, password });
      navigate(redirectTo, { replace: true });
    } catch {
      // error surfaced via the `error` state from useMutation
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
          E-posta
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
          Şifre
        </label>
        <input
          id="password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
        />
      </div>

      {error && (
        <p className="text-sm text-red-600" role="alert">
          {error.message}
        </p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-md bg-gray-900 px-3 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? "Giriş yapılıyor..." : "Giriş yap"}
      </button>

      <p className="text-center text-sm text-gray-600">
        Hesabın yok mu?{" "}
        <Link to="/register" className="font-medium text-gray-900 underline">
          Kayıt ol
        </Link>
      </p>
    </form>
  );
}
