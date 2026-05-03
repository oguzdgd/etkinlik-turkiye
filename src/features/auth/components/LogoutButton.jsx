import { useNavigate } from "react-router-dom";
import { useLogout } from "../hooks/useLogout";

export default function LogoutButton({ className }) {
  const navigate = useNavigate();
  const { mutateAsync, isPending } = useLogout();

  async function onClick() {
    await mutateAsync();
    navigate("/", { replace: true });
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isPending}
      className={
        className ??
        "rounded px-3 py-1.5 text-sm text-gray-600 transition-colors hover:text-gray-900 disabled:opacity-60"
      }
    >
      {isPending ? "Çıkılıyor..." : "Çıkış"}
    </button>
  );
}
