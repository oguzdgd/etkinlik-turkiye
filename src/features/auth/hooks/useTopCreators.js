import { useQuery } from "@tanstack/react-query";
import { fetchTopCreators } from "../services/authService";

export function useTopCreators() {
  return useQuery({
    queryKey: ["admin", "users", "top-creators"],
    queryFn: fetchTopCreators,
    staleTime: 2 * 60 * 1000,
  });
}
