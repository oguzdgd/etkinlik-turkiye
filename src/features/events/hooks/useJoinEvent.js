import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@features/auth/hooks/useAuth";
import { joinEvent, leaveEvent } from "../services/attendeesService";
import { eventKeys } from "../queryKeys";

// Optimistic toggle: flips isJoined and bumps the count immediately,
// then reconciles with server state on settle.
//
// Mutation input: "join" | "leave"
export function useJoinEvent(eventId) {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const uid = user?.uid;

  return useMutation({
    mutationFn: async (action) => {
      if (!uid) throw new Error("Katılmak için giriş yapmalısınız.");
      if (action === "join") return joinEvent(eventId, uid);
      if (action === "leave") return leaveEvent(eventId, uid);
      throw new Error(`Unknown action: ${action}`);
    },

    onMutate: async (action) => {
      const joinedKey = eventKeys.isJoined(eventId, uid);
      const countKey = eventKeys.attendeeCount(eventId);

      // Stop any in-flight refetches so they don't overwrite our optimistic value.
      await Promise.all([
        queryClient.cancelQueries({ queryKey: joinedKey }),
        queryClient.cancelQueries({ queryKey: countKey }),
      ]);

      const prev = {
        joined: queryClient.getQueryData(joinedKey),
        count: queryClient.getQueryData(countKey),
      };

      const willJoin = action === "join";
      const delta = willJoin ? 1 : -1;

      queryClient.setQueryData(joinedKey, willJoin);
      queryClient.setQueryData(countKey, (current) =>
        typeof current === "number" ? Math.max(0, current + delta) : current
      );

      return prev;
    },

    onError: (_err, _action, ctx) => {
      if (!ctx) return;
      queryClient.setQueryData(eventKeys.isJoined(eventId, uid), ctx.joined);
      queryClient.setQueryData(eventKeys.attendeeCount(eventId), ctx.count);
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: eventKeys.isJoined(eventId, uid) });
      queryClient.invalidateQueries({ queryKey: eventKeys.attendeeCount(eventId) });
    },
  });
}
