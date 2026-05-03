import { Link } from "react-router-dom";
import { useAuth } from "@features/auth/hooks/useAuth";
import { useIsJoined } from "../hooks/useIsJoined";
import { useJoinEvent } from "../hooks/useJoinEvent";

export default function JoinButton({ eventId }) {
  const { user } = useAuth();
  const { data: joined, isLoading: checking } = useIsJoined(eventId);
  const { mutate, isPending } = useJoinEvent(eventId);

  if (!user) {
    return (
      <Link
        to="/login"
        className="inline-flex items-center rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
      >
        Katılmak için giriş yap
      </Link>
    );
  }

  const disabled = checking || isPending;
  const action = joined ? "leave" : "join";
  const label = joined ? "Katıldın · Ayrıl" : "Katıl";

  return (
    <button
      type="button"
      onClick={() => mutate(action)}
      disabled={disabled}
      aria-pressed={Boolean(joined)}
      className={[
        "inline-flex items-center rounded-md px-4 py-2 text-sm font-medium transition",
        joined
          ? "border border-gray-300 bg-white text-gray-900 hover:bg-gray-50"
          : "bg-gray-900 text-white hover:bg-gray-800",
        "disabled:cursor-not-allowed disabled:opacity-60",
      ].join(" ")}
    >
      {label}
    </button>
  );
}
