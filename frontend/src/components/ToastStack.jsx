import { CheckCircle2, Info, X } from "lucide-react";

export default function ToastStack({ toasts, onDismiss }) {
  return (
    <div className="toast-stack">
      {toasts.map((toast) => (
        <div className={`toast ${toast.type || "info"}`} key={toast.id}>
          {toast.type === "success" ? <CheckCircle2 size={18} /> : <Info size={18} />}
          <span>{toast.message}</span>
          <button className="toast-close" onClick={() => onDismiss(toast.id)} title="Dismiss">
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}
