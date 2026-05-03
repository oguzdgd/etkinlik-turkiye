import { useMutation, useQueryClient } from "@tanstack/react-query";
import { logout } from "../services/authService";

export function useLogout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: logout,
    // Sign-out invalidates every per-user cached query.
    onSuccess: () => queryClient.clear(),
  });
}
