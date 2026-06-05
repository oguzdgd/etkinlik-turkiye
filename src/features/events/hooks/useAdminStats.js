import { useQuery } from "@tanstack/react-query";
import { eventKeys } from "../queryKeys";
import { fetchAdminStats } from "../services/eventsService";

export function useAdminStats() {
  return useQuery({
    queryKey: [...eventKeys.all, "admin-stats"],
    queryFn: fetchAdminStats,
    staleTime: 60 * 1000,
  });
}
