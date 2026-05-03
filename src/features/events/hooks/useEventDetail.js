import { useQuery } from "@tanstack/react-query";
import { fetchEventById } from "../services/eventsService";
import { eventKeys } from "../queryKeys";

export function useEventDetail(eventId) {
  return useQuery({
    queryKey: eventKeys.detail(eventId),
    queryFn: () => fetchEventById(eventId),
    enabled: Boolean(eventId),
  });
}
