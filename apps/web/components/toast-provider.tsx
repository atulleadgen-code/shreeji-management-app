'use client';

import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { CircleAlert, CircleCheck, X } from 'lucide-react';

type ToastType = 'success' | 'error';
type Toast = { id: number; type: ToastType; message: string };
type ToastContextValue = { notify: (type: ToastType, message: string) => void };

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextId = useRef(0);
  const timers = useRef(new Map<number, ReturnType<typeof setTimeout>>());

  const dismiss = useCallback((id: number) => {
    const timer = timers.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timers.current.delete(id);
    }
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const notify = useCallback((type: ToastType, message: string) => {
    const id = ++nextId.current;
    setToasts((current) => [...current, { id, type, message }]);
    timers.current.set(id, setTimeout(() => dismiss(id), 4200));
  }, [dismiss]);

  useEffect(() => () => {
    for (const timer of timers.current.values()) {
      clearTimeout(timer);
    }
  }, []);

  return (
    <ToastContext.Provider value={{ notify }}>
      {children}
      <div aria-label="Notifications" className="pointer-events-none fixed right-4 top-4 z-[100] flex w-[min(24rem,calc(100vw-2rem))] flex-col gap-2" role="region">
        {toasts.map((toast) => {
          const isSuccess = toast.type === 'success';
          const Icon = isSuccess ? CircleCheck : CircleAlert;
          return (
            <div
              className={`pointer-events-auto flex items-start gap-3 rounded-xl border bg-white p-4 shadow-lg shadow-slate-950/10 ${
                isSuccess ? 'border-emerald-200' : 'border-red-200'
              }`}
              key={toast.id}
              role={isSuccess ? 'status' : 'alert'}
            >
              <Icon
                aria-hidden="true"
                className={isSuccess ? 'mt-0.5 shrink-0 text-emerald-700' : 'mt-0.5 shrink-0 text-red-700'}
                size={18}
              />
              <p className="min-w-0 flex-1 text-sm leading-5 text-slate-800">{toast.message}</p>
              <button
                aria-label="Dismiss notification"
                className="-mr-1 -mt-1 grid size-7 shrink-0 place-items-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                onClick={() => dismiss(toast.id)}
                type="button"
              >
                <X aria-hidden="true" size={15} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider.');
  }
  return context;
}