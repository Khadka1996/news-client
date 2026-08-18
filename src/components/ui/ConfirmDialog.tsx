import { X } from "lucide-react";

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
  danger = false,
}: {
  open: boolean;
  title: string;
  message: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  danger?: boolean;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-xl font-bold text-neutral-900">{title}</h3>
          <button type="button" onClick={onCancel} className="rounded-full p-2 text-neutral-500 hover:bg-neutral-100" aria-label="Close dialog">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="text-sm text-neutral-600">{message}</div>

        <div className="mt-6 flex justify-end gap-2">
          <button type="button" onClick={onCancel} className="rounded-xl border border-neutral-200 bg-white px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50">
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`rounded-xl px-4 py-2 text-sm font-semibold text-white ${danger ? "bg-red-600 hover:bg-red-500" : "bg-brand-gold hover:bg-brand-gold-light"}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
