import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@features/auth/hooks/useAuth";
import { leaveEvent } from "../services/attendeesService";
import { eventKeys } from "../queryKeys";

export function useLeaveEvent(eventId) {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const uid = user?.uid;

  return useMutation({
    mutationFn: () => {
      if (!uid) throw new Error("Giriş yapmalısınız.");
      return leaveEvent(eventId, uid);
    },

    onMutate: async () => {
      const joinedKey = eventKeys.isJoined(eventId, uid);
      const countKey = eventKeys.attendeeCount(eventId);

      await Promise.all([
        queryClient.cancelQueries({ queryKey: joinedKey }),
        queryClient.cancelQueries({ queryKey: countKey }),
      ]);

      const prev = {
        joined: queryClient.getQueryData(joinedKey),
        count: queryClient.getQueryData(countKey),
      };

      queryClient.setQueryData(joinedKey, false);
      queryClient.setQueryData(countKey, (c) =>
        typeof c === "number" ? Math.max(0, c - 1) : c
      );

      return prev;
    },

    onError: (_err, _vars, ctx) => {
      if (!ctx) return;
      queryClient.setQueryData(eventKeys.isJoined(eventId, uid), ctx.joined);
      queryClient.setQueryData(eventKeys.attendeeCount(eventId), ctx.count);
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: eventKeys.isJoined(eventId, uid) });
      queryClient.invalidateQueries({ queryKey: eventKeys.attendeeCount(eventId) });
      queryClient.invalidateQueries({ queryKey: eventKeys.userJoined(uid) });
    },
  });
}
