import { useQuery } from "@tanstack/react-query";
import { fetchPendingEvents } from "../services/eventsService";
import { eventKeys } from "../queryKeys";

export function usePendingEvents() {
  return useQuery({
    queryKey: eventKeys.pending(),
    queryFn: () => fetchPendingEvents(),
  });
}
