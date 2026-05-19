import { useAuth } from "@features/auth/hooks/useAuth";
import { useFavorites } from "../hooks/useFavorites";
import { useToggleFavorite } from "../hooks/useToggleFavorite";

export default function FavoriteButton({ eventId }) {
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
      type="button"
      onClick={handleClick}
      disabled={isPending}
      aria-label={isFavorited ? "Favorilerden çıkar" : "Favorilere ekle"}
      className={`focus-ring grid h-9 w-9 place-items-center rounded-full backdrop-blur transition-colors disabled:opacity-50
        ${isFavorited
          ? "bg-black text-white"
          : "bg-white/85 text-zinc-700 hover:bg-white"
        }`}
    >
      <svg
        viewBox="0 0 24 24"
        fill={isFavorited ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-4 w-4"
      >
        <path d="M12 20s-7-4.5-9-9.5C1.5 6.5 4.5 3.5 8 4.5c1.7.5 3 1.7 4 3 1-1.3 2.3-2.5 4-3 3.5-1 6.5 2 5 6-2 5-9 9.5-9 9.5Z" />
      </svg>
    </button>
  );
}
