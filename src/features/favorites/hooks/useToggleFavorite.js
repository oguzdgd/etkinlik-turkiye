import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@features/auth/hooks/useAuth";
import { addFavorite, removeFavorite } from "../services/favoritesService";
import { favoriteKeys } from "../queryKeys";

export function useToggleFavorite() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const uid = user?.uid;

  return useMutation({
    mutationFn: async ({ eventId, isFavorited }) => {
      if (!uid) throw new Error("Favori eklemek için giriş yapmalısınız.");
      if (isFavorited) return removeFavorite(uid, eventId);
      return addFavorite(uid, eventId);
    },

    onMutate: async ({ eventId, isFavorited }) => {
      const key = favoriteKeys.user(uid);
      await queryClient.cancelQueries({ queryKey: key });

      const prev = queryClient.getQueryData(key);

      queryClient.setQueryData(key, (current = new Set()) => {
        const next = new Set(current);
        if (isFavorited) next.delete(eventId);
        else next.add(eventId);
        return next;
      });

      return { prev };
    },

    onError: (_err, _vars, ctx) => {
      if (ctx?.prev !== undefined) {
        queryClient.setQueryData(favoriteKeys.user(uid), ctx.prev);
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: favoriteKeys.user(uid) });
    },
  });
}
