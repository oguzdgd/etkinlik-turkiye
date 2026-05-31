import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchEventById } from "../services/eventsService";
import { eventKeys } from "../queryKeys";

export function useEventDetail(eventId) {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: eventKeys.detail(eventId),
    queryFn: () => fetchEventById(eventId),
    enabled: Boolean(eventId),
    // Seed from any already-loaded list cache so title/image/date paint
    // instantly while the full record (description etc.) is fetched. The list
    // summary is partial — EventDetailPage renders missing fields gracefully.
    placeholderData: () => {
      const lists = queryClient.getQueriesData({ queryKey: eventKeys.lists() });
      for (const [, data] of lists) {
        for (const page of data?.pages ?? []) {
          const found = page.items?.find((e) => e.id === eventId);
          if (found) return found;
        }
      }
      return undefined;
    },
  });
}
