import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  text: string;
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer = ({ toasts, onDismiss }: ToastProps) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 sm:left-auto sm:right-5 sm:translate-x-0 z-[100] flex flex-col gap-2 max-w-[90vw] sm:max-w-sm w-full pointer-events-none px-2 sm:px-0">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto flex items-center justify-between p-4 rounded-2xl shadow-panel border text-xs font-semibold backdrop-blur-xl transition-all duration-200 ${
            toast.type === 'success'
              ? 'bg-ink-950/90 border-whatsapp/30 text-slate-200'
              : toast.type === 'error'
              ? 'bg-ink-950/90 border-rose-500/30 text-slate-200'
              : 'bg-ink-950/90 border-slate-800/80 text-slate-200'
          }`}
        >
          <div className="flex items-center gap-3">
            {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 text-whatsapp shrink-0" />}
            {toast.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-405 shrink-0" />}
            {toast.type === 'info' && <Info className="w-4 h-4 text-sky-400 shrink-0" />}
            <span className="leading-snug">{toast.text}</span>
          </div>
          <button
            onClick={() => onDismiss(toast.id)}
            className="text-slate-505 hover:text-white p-1 rounded-lg ml-2 cursor-pointer transition duration-150"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
};