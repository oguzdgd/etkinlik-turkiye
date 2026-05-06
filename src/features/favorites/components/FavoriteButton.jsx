import { useAuth } from "@features/auth/hooks/useAuth";
import { useFavorites } from "../hooks/useFavorites";
import { useToggleFavorite } from "../hooks/useToggleFavorite";

export default function FavoriteButton({ eventId, className = "" }) {
  const { user } = useAuth();
  const { data: favorites = new Set() } = useFavorites();
  const { mutate, isPending } = useToggleFavorite();

  if (!user) return null;

  const isFavorited = favorites.has(eventId);

  function handleClick(e) {
    e.preventDefault();
    e.stopPropagation();
    if (!isPending) mutate({ eventId, isFavorited });
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      aria-label={isFavorited ? "Favorilerden çıkar" : "Favorilere ekle"}
      className={`flex items-center justify-center rounded-full p-1.5 transition
        ${isFavorited
          ? "text-red-500 hover:text-red-600"
          : "text-gray-400 hover:text-red-400"
        }
        disabled:opacity-50 ${className}`}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill={isFavorited ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth={2}
        className="h-5 w-5"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
        />
      </svg>
    </button>
  );
}
