import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@features/auth/hooks/useAuth";
import { deleteEvent } from "../services/eventsService";
import { eventKeys } from "../queryKeys";

export function useDeleteEvent() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: (eventId) => deleteEvent(eventId, user?.uid),
    onSuccess: (_, eventId) => {
      queryClient.invalidateQueries({ queryKey: eventKeys.userEvents(user?.uid) });
      queryClient.invalidateQueries({ queryKey: eventKeys.lists() });
      queryClient.invalidateQueries({ queryKey: eventKeys.map() });
      queryClient.invalidateQueries({ queryKey: eventKeys.pending() });
      queryClient.removeQueries({ queryKey: eventKeys.detail(eventId) });
    },
  });
}
