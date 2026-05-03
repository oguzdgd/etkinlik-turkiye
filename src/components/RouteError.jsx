import { Link, isRouteErrorResponse, useRouteError } from "react-router-dom";

export default function RouteError() {
  const error = useRouteError();

  if (isRouteErrorResponse(error)) {
    return (
      <div className="mx-auto max-w-xl p-6">
        <h1 className="text-xl font-semibold">
          {error.status} {error.statusText}
        </h1>
        {error.data ? <p className="mt-2 text-sm text-gray-600">{String(error.data)}</p> : null}
        <Link to="/" className="mt-4 inline-block text-sm underline">
          Ana sayfaya dön
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl p-6">
      <h1 className="text-xl font-semibold">Beklenmeyen bir hata oluştu</h1>
      <p className="mt-2 text-sm text-gray-600">{error?.message ?? "Unknown error"}</p>
      <Link to="/" className="mt-4 inline-block text-sm underline">
        Ana sayfaya dön
      </Link>
    </div>
  );
}
