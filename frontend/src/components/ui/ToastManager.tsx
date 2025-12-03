"use client";

import { cn } from "@/lib/utils";
import React, { createContext, useCallback, useContext, useState } from "react";

// ==========================================
// Toast Types
// ==========================================

type ToastType = "success" | "error" | "warning" | "info";

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  push: (message: string, type?: ToastType) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  warning: (message: string) => void;
  info: (message: string) => void;
  dismiss: (id: string) => void;
}

// ==========================================
// Toast Context
// ==========================================

const ToastContext = createContext<ToastContextType | null>(null);

// ==========================================
// Toast Provider
// ==========================================

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const push = useCallback((message: string, type: ToastType = "info") => {
    const id = Date.now().toString() + Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  }, []);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const success = useCallback((msg: string) => push(msg, "success"), [push]);
  const error = useCallback((msg: string) => push(msg, "error"), [push]);
  const warning = useCallback((msg: string) => push(msg, "warning"), [push]);
  const info = useCallback((msg: string) => push(msg, "info"), [push]);

  return (
    <ToastContext.Provider
      value={{ push, success, error, warning, info, dismiss }}
    >
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}

// ==========================================
// Toast Hook
// ==========================================

export function useToast(): ToastContextType {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used within ToastProvider");
  return context;
}

// ==========================================
// Toast Container
// ==========================================

const typeStyles: Record<ToastType, string> = {
  success: "bg-green-600",
  error: "bg-red-600",
  warning: "bg-yellow-500",
  info: "bg-gray-800",
};

function ToastContainer({
  toasts,
  onDismiss,
}: {
  toasts: Toast[];
  onDismiss: (id: string) => void;
}) {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 max-w-sm">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={cn(
            "flex items-center gap-3 px-4 py-3 rounded-lg text-white shadow-lg",
            "animate-in slide-in-from-right-5 fade-in-0 duration-200",
            typeStyles[toast.type]
          )}
        >
          <span className="flex-1 text-sm">{toast.message}</span>
          <button
            onClick={() => onDismiss(toast.id)}
            className="p-1 hover:bg-white/20 rounded"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
      ))}
    </div>
  );
}

export default ToastProvider;
