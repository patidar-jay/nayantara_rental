// ============================================================================
// Toast — Lightweight global notification system
//
// Usage:
//   import { useToast, ToastProvider } from '@presentation/shared/Toast';
//
//   // In your root layout:
//   <ToastProvider>...</ToastProvider>
//
//   // In any component:
//   const toast = useToast();
//   toast.success('Booking created!');
//   toast.error('Something went wrong');
//   toast.info('Checking availability...');
// ============================================================================

import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { ReactNode } from 'react';
import { cn } from '@utils';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration: number;
}

interface ToastContextValue {
  success: (message: string, duration?: number) => void;
  error: (message: string, duration?: number) => void;
  info: (message: string, duration?: number) => void;
  warning: (message: string, duration?: number) => void;
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within a ToastProvider');
  return ctx;
}

// ---------------------------------------------------------------------------
// Toast Item
// ---------------------------------------------------------------------------

const ICONS: Record<ToastType, string> = {
  success: '✓',
  error: '✕',
  info: 'ℹ',
  warning: '⚠',
};

const COLORS: Record<ToastType, { bg: string; border: string; icon: string }> = {
  success: { bg: 'bg-green-500/10', border: 'border-green-500/30', icon: 'text-green-400 bg-green-500/20' },
  error:   { bg: 'bg-red-500/10',   border: 'border-red-500/30',   icon: 'text-red-400 bg-red-500/20' },
  info:    { bg: 'bg-blue-500/10',  border: 'border-blue-500/30',  icon: 'text-blue-400 bg-blue-500/20' },
  warning: { bg: 'bg-yellow-500/10', border: 'border-yellow-500/30', icon: 'text-yellow-400 bg-yellow-500/20' },
};

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: (id: string) => void }) {
  const [exiting, setExiting] = useState(false);
  const color = COLORS[toast.type];

  useEffect(() => {
    const timer = setTimeout(() => {
      setExiting(true);
      setTimeout(() => onDismiss(toast.id), 300);
    }, toast.duration);
    return () => clearTimeout(timer);
  }, [toast.id, toast.duration, onDismiss]);

  return (
    <div
      className={cn(
        'flex items-center gap-3 rounded-xl border px-4 py-3 shadow-xl backdrop-blur-xl transition-all duration-300',
        color.bg, color.border,
        exiting ? 'opacity-0 translate-x-8' : 'opacity-100 translate-x-0',
      )}
      role="alert"
    >
      <span className={cn('flex h-6 w-6 items-center justify-center rounded-lg text-xs font-bold flex-shrink-0', color.icon)}>
        {ICONS[toast.type]}
      </span>
      <p className="text-sm text-text flex-1">{toast.message}</p>
      <button
        type="button"
        onClick={() => { setExiting(true); setTimeout(() => onDismiss(toast.id), 300); }}
        className="text-text-muted hover:text-text transition-colors flex-shrink-0"
        aria-label="Dismiss"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

let toastCounter = 0;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((type: ToastType, message: string, duration = 4000) => {
    const id = `toast-${++toastCounter}-${Date.now()}`;
    setToasts((prev) => [...prev.slice(-4), { id, type, message, duration }]); // max 5
  }, []);

  const value: ToastContextValue = {
    success: useCallback((msg: string, dur?: number) => addToast('success', msg, dur), [addToast]),
    error:   useCallback((msg: string, dur?: number) => addToast('error', msg, dur), [addToast]),
    info:    useCallback((msg: string, dur?: number) => addToast('info', msg, dur), [addToast]),
    warning: useCallback((msg: string, dur?: number) => addToast('warning', msg, dur), [addToast]),
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      {/* Toast Container */}
      <div className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2 w-full max-w-sm pointer-events-none">
        {toasts.map((toast) => (
          <div key={toast.id} className="pointer-events-auto">
            <ToastItem toast={toast} onDismiss={dismiss} />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
