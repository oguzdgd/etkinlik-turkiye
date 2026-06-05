import { useQuery } from "@tanstack/react-query";
import { fetchUserStats } from "../services/authService";

export function useUserStats() {
  return useQuery({
    queryKey: ["admin", "users", "stats"],
    queryFn: fetchUserStats,
    staleTime: 60 * 1000,
  });
}
