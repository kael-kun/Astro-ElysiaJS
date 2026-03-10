import React, { createContext, useContext, ReactNode } from "react";
import { useToast } from "../hooks/useToast";
import { ToastContainer } from "../components/ui/ToastContainer";

interface ToastContextType {
  toasts: ReturnType<typeof useToast>["toasts"];
  showToast: ReturnType<typeof useToast>["showToast"];
  removeToast: ReturnType<typeof useToast>["removeToast"];
  clearToasts: ReturnType<typeof useToast>["clearToasts"];
  success: ReturnType<typeof useToast>["success"];
  error: ReturnType<typeof useToast>["error"];
  warning: ReturnType<typeof useToast>["warning"];
  info: ReturnType<typeof useToast>["info"];
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export interface ToastProviderProps {
  children: ReactNode;
  position?: "top-right" | "top-left" | "bottom-right" | "bottom-left" | "top-center" | "bottom-center";
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children, position = "top-right" }) => {
  const toast = useToast();

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <ToastContainer
        toasts={toast.toasts.map((t) => ({ ...t, onClose: () => toast.removeToast(t.id) }))}
        onClose={toast.removeToast}
        position={position}
      />
    </ToastContext.Provider>
  );
};

export const useToastContext = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error("useToastContext must be used within a ToastProvider");
  }
  return context;
};
