import { useQuery } from "@tanstack/react-query";
import { fetchEventsForMap } from "../services/eventsService";
import { eventKeys } from "../queryKeys";

export function useEventsForMap() {
  return useQuery({
    queryKey: eventKeys.map(),
    queryFn: fetchEventsForMap,
  });
}
