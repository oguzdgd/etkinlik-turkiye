import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@features/auth/hooks/useAuth";
import { fetchUserJoinedEvents } from "../services/attendeesService";
import { eventKeys } from "../queryKeys";

export function useUserJoinedEvents() {
  const { user } = useAuth();
  const uid = user?.uid;

  return useQuery({
    queryKey: eventKeys.userJoined(uid),
    queryFn: () => fetchUserJoinedEvents(uid),
    enabled: !!uid,
  });
}
