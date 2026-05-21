// Public surface of the events feature.
// Pages and other features should only import from this barrel —
// internal files (services/, queryKeys.js) stay private to the feature.

export { default as EventCard } from "./components/EventCard";
export { default as EventList } from "./components/EventList";
export { default as EventFilters } from "./components/EventFilters";
export { default as JoinButton } from "./components/JoinButton";
export { default as AttendeeCount } from "./components/AttendeeCount";
export { default as EventCreateForm } from "./components/EventCreateForm";
export { default as PendingEventList } from "./components/PendingEventList";
export { default as EventMap } from "./components/EventMap";

export { useEvents } from "./hooks/useEvents";
export { useEventDetail } from "./hooks/useEventDetail";
export { useAttendeeCount } from "./hooks/useAttendeeCount";
export { useIsJoined } from "./hooks/useIsJoined";
export { useJoinEvent } from "./hooks/useJoinEvent";
export { useCreateEvent } from "./hooks/useCreateEvent";
export { useUpdateEvent } from "./hooks/useUpdateEvent";
export { useDeleteEvent } from "./hooks/useDeleteEvent";
export { usePendingEvents } from "./hooks/usePendingEvents";
export { useModerateEvent } from "./hooks/useModerateEvent";
export { useEventsForMap } from "./hooks/useEventsForMap";
export { useUserEvents } from "./hooks/useUserEvents";
export { useUserJoinedEvents } from "./hooks/useUserJoinedEvents";
export { useLeaveEvent } from "./hooks/useLeaveEvent";
export { useEventsForCalendar } from "./hooks/useEventsForCalendar";
export { useEventStats } from "./hooks/useEventStats";
