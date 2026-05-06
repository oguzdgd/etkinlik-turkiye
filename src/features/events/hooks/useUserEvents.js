import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@features/auth/hooks/useAuth";
import { fetchUserEvents } from "../services/eventsService";
import { eventKeys } from "../queryKeys";

export function useUserEvents() {
  const { user } = useAuth();
  const uid = user?.uid;

  return useQuery({
    queryKey: eventKeys.userEvents(uid),
    queryFn: () => fetchUserEvents(uid),
    enabled: !!uid,
  });
}
