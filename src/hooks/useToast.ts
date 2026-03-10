import { useState, useCallback } from "react";

export interface Toast {
  id: string;
  message: string;
  type?: "success" | "error" | "warning" | "info";
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export const useToast = () => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((toast: Omit<Toast, "id">) => {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    const newToast: Toast = {
      id,
      ...toast,
    };

    setToasts((prev) => [...prev, newToast]);

    // Auto-remove after duration if specified
    if (toast.duration !== 0) {
      const duration = toast.duration || 5000;
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }

    return id;
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const clearToasts = useCallback(() => {
    setToasts([]);
  }, []);

  // Convenience methods
  const success = useCallback((message: string, options?: Partial<Toast>) => {
    return showToast({ message, type: "success", ...options });
  }, [showToast]);

  const error = useCallback((message: string, options?: Partial<Toast>) => {
    return showToast({ message, type: "error", duration: 8000, ...options });
  }, [showToast]);

  const warning = useCallback((message: string, options?: Partial<Toast>) => {
    return showToast({ message, type: "warning", ...options });
  }, [showToast]);

  const info = useCallback((message: string, options?: Partial<Toast>) => {
    return showToast({ message, type: "info", ...options });
  }, [showToast]);

  return {
    toasts,
    showToast,
    removeToast,
    clearToasts,
    success,
    error,
    warning,
    info,
  };
};