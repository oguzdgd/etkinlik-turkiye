import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@features/auth/hooks/useAuth";
import { fetchUserFavoriteEvents } from "../services/favoritesService";
import { favoriteKeys } from "../queryKeys";

export function useUserFavoriteEvents() {
  const { user } = useAuth();
  const uid = user?.uid;

  return useQuery({
    queryKey: favoriteKeys.userEvents(uid),
    queryFn: () => fetchUserFavoriteEvents(uid),
    enabled: !!uid,
  });
}
