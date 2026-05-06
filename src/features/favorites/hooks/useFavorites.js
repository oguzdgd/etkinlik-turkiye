import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@features/auth/hooks/useAuth";
import { fetchUserFavoriteIds } from "../services/favoritesService";
import { favoriteKeys } from "../queryKeys";

// Returns a Set of event IDs the current user has favorited.
// Disabled when unauthenticated — returns empty Set.
export function useFavorites() {
  const { user } = useAuth();
  const uid = user?.uid;

  return useQuery({
    queryKey: favoriteKeys.user(uid),
    queryFn: async () => {
      const ids = await fetchUserFavoriteIds(uid);
      return new Set(ids);
    },
    enabled: !!uid,
    placeholderData: new Set(),
  });
}
