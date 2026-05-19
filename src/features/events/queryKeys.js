// Single source of truth for event-related query keys.
// Hierarchical so `invalidateQueries({ queryKey: eventKeys.all })` clears everything.
export const eventKeys = {
  all: ["events"],
  lists: () => [...eventKeys.all, "list"],
  list: (filters = {}) => [...eventKeys.lists(), filters],
  details: () => [...eventKeys.all, "detail"],
  detail: (id) => [...eventKeys.details(), id],
  attendeeCount: (id) => [...eventKeys.all, "attendees", id],
  isJoined: (eventId, uid) => [...eventKeys.all, "isJoined", eventId, uid],
  pending: () => [...eventKeys.all, "pending"],
  map: () => [...eventKeys.all, "map"],
  userEvents: (uid) => [...eventKeys.all, "userEvents", uid],
  userJoined: (uid) => [...eventKeys.all, "userJoined", uid],
  calendar: (year, month) => [...eventKeys.all, "calendar", year, month],
};
