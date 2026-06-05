import { useQuery } from "@tanstack/react-query";
import { fetchRecentUsers } from "../services/authService";

export function useRecentUsers() {
  return useQuery({
    queryKey: ["admin", "users", "recent"],
    queryFn: fetchRecentUsers,
    staleTime: 60 * 1000,
  });
}
