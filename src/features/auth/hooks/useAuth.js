import { useAuthContext } from "../context/AuthContext";

// Returns: { user, role, isLoading }
//   user      – { uid, email, displayName, photoURL } | null
//   role      – "user" | "admin" | null
//   isLoading – always false in consumers (provider blocks until resolved)
export function useAuth() {
  return useAuthContext();
}
