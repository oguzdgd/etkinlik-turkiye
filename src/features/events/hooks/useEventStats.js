import { useQuery } from "@tanstack/react-query";
import { eventKeys } from "../queryKeys";
import { fetchEventStats } from "../services/eventsService";

export function useEventStats() {
  return useQuery({
    queryKey: [...eventKeys.all, "stats"],
    queryFn: fetchEventStats,
    staleTime: 5 * 60 * 1000,
  });
}
