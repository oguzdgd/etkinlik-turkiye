import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useRegister } from "../hooks/useRegister";

export default function RegisterForm() {
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();
  const { mutateAsync, isPending, error } = useRegister();

  async function onSubmit(e) {
    e.preventDefault();
    try {
      await mutateAsync({ email, password, displayName });
      navigate("/", { replace: true });
    } catch {
      // surfaced via `error`
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label htmlFor="displayName" className="block text-sm font-medium text-gray-700">
          Ad Soyad
        </label>
        <input
          id="displayName"
          type="text"
          autoComplete="name"
          required
          minLength={2}
          maxLength={60}
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
        />
      </div>

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
          autoComplete="new-password"
          required
          minLength={6}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
        />
        <p className="mt-1 text-xs text-gray-500">En az 6 karakter.</p>
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
        {isPending ? "Kayıt yapılıyor..." : "Kayıt ol"}
      </button>

      <p className="text-center text-sm text-gray-600">
        Hesabın var mı?{" "}
        <Link to="/login" className="font-medium text-gray-900 underline">
          Giriş yap
        </Link>
      </p>
    </form>
  );
}
