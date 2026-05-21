import { useMutation, useQueryClient } from "@tanstack/react-query";
import { setEventStatus } from "../services/eventsService";
import { eventKeys } from "../queryKeys";
import { EVENT_STATUS } from "@lib/constants";

// Optimistically removes the moderated event from the pending list,
// then invalidates downstream caches:
//   - the pending list (re-fetch authoritative state)
//   - this event's detail (status changed)
//   - the public list, but only if we approved (a new event should now appear)
export function useModerateEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ eventId, status, reason }) => setEventStatus(eventId, status, reason),

    onMutate: async ({ eventId }) => {
      const key = eventKeys.pending();
      await queryClient.cancelQueries({ queryKey: key });
      const prev = queryClient.getQueryData(key);
      queryClient.setQueryData(key, (current) =>
        Array.isArray(current) ? current.filter((e) => e.id !== eventId) : current
      );
      return { prev };
    },

    onError: (_err, _vars, ctx) => {
      if (ctx?.prev !== undefined) {
        queryClient.setQueryData(eventKeys.pending(), ctx.prev);
      }
    },

    onSettled: (_data, _err, { eventId, status }) => {
      queryClient.invalidateQueries({ queryKey: eventKeys.pending() });
      queryClient.invalidateQueries({ queryKey: eventKeys.detail(eventId) });
      // Invalidate all userEvents queries — owner's dashboard shows updated status
      queryClient.invalidateQueries({ queryKey: [...eventKeys.all, "userEvents"] });
      if (status === EVENT_STATUS.APPROVED) {
        queryClient.invalidateQueries({ queryKey: eventKeys.lists() });
        queryClient.invalidateQueries({ queryKey: eventKeys.map() });
      }
    },
  });
}
