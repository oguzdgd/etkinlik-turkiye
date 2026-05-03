import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <section className="space-y-3">
      <h1 className="text-3xl font-bold">404</h1>
      <p className="text-gray-600">Aradığınız sayfa bulunamadı.</p>
      <Link to="/" className="inline-block text-sm underline">
        Ana sayfaya dön
      </Link>
    </section>
  );
}
