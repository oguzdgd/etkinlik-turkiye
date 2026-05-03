import { useAttendeeCount } from "../hooks/useAttendeeCount";

export default function AttendeeCount({ eventId }) {
  const { data, isLoading } = useAttendeeCount(eventId);

  return (
    <span className="text-sm text-gray-600" aria-live="polite">
      {isLoading ? "—" : `${data ?? 0} katılımcı`}
    </span>
  );
}
