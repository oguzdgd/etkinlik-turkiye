import { useQuery } from "@tanstack/react-query";
import { eventKeys } from "../queryKeys";
import { fetchEventsForCalendar } from "../services/eventsService";

export function useEventsForCalendar(year, month) {
  return useQuery({
    queryKey: eventKeys.calendar(year, month),
    queryFn: () => fetchEventsForCalendar(year, month),
  });
}
