export default function Spinner({ label = "Yükleniyor..." }) {
  return (
    <div className="flex items-center justify-center p-8" role="status" aria-live="polite">
      <span className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-gray-900" />
      <span className="sr-only">{label}</span>
    </div>
  );
}
