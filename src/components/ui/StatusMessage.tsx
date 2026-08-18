type StatusType = "success" | "error" | "info";

export function StatusMessage({
  type = "info",
  title,
  message,
}: {
  type?: StatusType;
  title?: string;
  message: string;
}) {
  const tone = {
    success: "border-emerald-200 bg-emerald-50 text-emerald-700",
    error: "border-red-200 bg-red-50 text-red-700",
    info: "border-blue-200 bg-blue-50 text-blue-700",
  }[type];

  return (
    <div className={`mb-4 rounded-xl border px-3 py-2 text-sm ${tone}`} role="status" aria-live="polite">
      {title && <div className="font-semibold">{title}</div>}
      <div>{message}</div>
    </div>
  );
}
