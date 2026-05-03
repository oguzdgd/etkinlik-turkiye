import { useQuery } from "@tanstack/react-query";
import { fetchAttendeeCount } from "../services/attendeesService";
import { eventKeys } from "../queryKeys";

export function useAttendeeCount(eventId) {
  return useQuery({
    queryKey: eventKeys.attendeeCount(eventId),
    queryFn: () => fetchAttendeeCount(eventId),
    enabled: Boolean(eventId),
  });
}
