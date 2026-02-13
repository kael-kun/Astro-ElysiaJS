import React, { ReactNode } from "react";
import { AuthProvider } from "./AuthProvider";
import { ToastProvider } from "./ToastProvider";

export interface AppProviderProps {
  children: ReactNode;
  toastPosition?: "top-right" | "top-left" | "bottom-right" | "bottom-left" | "top-center" | "bottom-center";
}

export const AppProvider: React.FC<AppProviderProps> = ({
  children,
  toastPosition = "top-right",
}) => {
  return (
    <AuthProvider>
      <ToastProvider position={toastPosition}>
        {children}
      </ToastProvider>
    </AuthProvider>
  );
};