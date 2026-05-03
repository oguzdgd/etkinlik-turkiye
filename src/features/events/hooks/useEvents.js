import { useInfiniteQuery } from "@tanstack/react-query";
import { fetchEventsPage } from "../services/eventsService";
import { eventKeys } from "../queryKeys";

// pageParam is a numeric offset (0, pageSize, 2*pageSize…).
// fetchEventsPage returns the next offset as nextCursor when more rows exist.
export function useEvents({ pageSize = 12 } = {}) {
  return useInfiniteQuery({
    queryKey: eventKeys.list({ pageSize }),
    queryFn: ({ pageParam = 0 }) => fetchEventsPage({ pageSize, cursor: pageParam }),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
  });
}
