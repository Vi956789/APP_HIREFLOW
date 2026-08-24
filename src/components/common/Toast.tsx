import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastMessage {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
}

interface SingleToastProps {
  message: string;
  type?: ToastType;
  onClose: () => void;
  duration?: number;
}

export const Toast: React.FC<SingleToastProps> = ({
  message,
  type = 'info',
  onClose,
  duration = 3500,
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <div className="fixed bottom-5 right-5 z-50 pointer-events-auto flex items-center gap-3 py-3 px-4 rounded-2xl border shadow-xl backdrop-blur-md bg-white/95 dark:bg-slate-900/95 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white transition-all max-w-sm">
      {type === 'success' ? (
        <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
      ) : type === 'error' ? (
        <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
      ) : type === 'warning' ? (
        <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />
      ) : (
        <Info className="w-5 h-5 text-blue-500 shrink-0" />
      )}

      <span className="text-xs font-semibold leading-snug flex-1">{message}</span>

      <button
        onClick={onClose}
        className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-md transition-colors cursor-pointer"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border shadow-lg backdrop-blur-md transition-all ${
              toast.type === 'success'
                ? 'bg-white/95 border-emerald-200 text-slate-900 dark:bg-slate-900/95 dark:border-emerald-800 dark:text-white'
                : toast.type === 'error'
                ? 'bg-white/95 border-rose-200 text-slate-900 dark:bg-slate-900/95 dark:border-rose-800 dark:text-white'
                : 'bg-white/95 border-blue-200 text-slate-900 dark:bg-slate-900/95 dark:border-blue-800 dark:text-white'
            }`}
          >
            {toast.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
            ) : toast.type === 'error' ? (
              <AlertCircle className="w-5 h-5 text-rose-600 mt-0.5 shrink-0" />
            ) : (
              <Info className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
            )}

            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold text-slate-900 dark:text-white leading-snug">
                {toast.title}
              </h4>
              {toast.description && (
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 leading-relaxed">
                  {toast.description}
                </p>
              )}
            </div>

            <button
              onClick={() => onDismiss(toast.id)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-md transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
