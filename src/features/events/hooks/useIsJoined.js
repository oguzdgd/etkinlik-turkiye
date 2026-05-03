import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@features/auth/hooks/useAuth";
import { isJoined } from "../services/attendeesService";
import { eventKeys } from "../queryKeys";

export function useIsJoined(eventId) {
  const { user } = useAuth();
  const uid = user?.uid;

  return useQuery({
    queryKey: eventKeys.isJoined(eventId, uid),
    queryFn: () => isJoined(eventId, uid),
    enabled: Boolean(eventId && uid),
  });
}
