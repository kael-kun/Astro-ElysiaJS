import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";

export interface LoadingState {
  global: boolean;
  [key: string]: boolean;
}

export interface LoadingContextType {
  loading: LoadingState;
  isLoading: (key?: string) => boolean;
  setLoading: (key: string, value: boolean) => void;
  startLoading: (key?: string) => void;
  stopLoading: (key?: string) => void;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export interface LoadingProviderProps {
  children: ReactNode;
}

export const LoadingProvider: React.FC<LoadingProviderProps> = ({ children }) => {
  const [loading, setLoadingState] = useState<LoadingState>({ global: false });

  const isLoading = useCallback(
    (key: string = "global") => loading[key] || false,
    [loading]
  );

  const setLoading = useCallback((key: string, value: boolean) => {
    setLoadingState((prev) => ({ ...prev, [key]: value }));
  }, []);

  const startLoading = useCallback((key: string = "global") => {
    setLoadingState((prev) => ({ ...prev, [key]: true }));
  }, []);

  const stopLoading = useCallback((key: string = "global") => {
    setLoadingState((prev) => ({ ...prev, [key]: false }));
  }, []);

  const value: LoadingContextType = {
    loading,
    isLoading,
    setLoading,
    startLoading,
    stopLoading,
  };

  return (
    <LoadingContext.Provider value={value}>
      {children}
    </LoadingContext.Provider>
  );
};

export const useLoading = (key?: string): LoadingContextType => {
  const context = useContext(LoadingContext);
  if (context === undefined) {
    throw new Error("useLoading must be used within a LoadingProvider");
  }

  if (key) {
    return {
      ...context,
      isLoading: () => context.isLoading(key),
      setLoading: (k: string, v: boolean) => context.setLoading(`${key}.${k}`, v),
      startLoading: (k?: string) => context.startLoading(k ? `${key}.${k}` : key),
      stopLoading: (k?: string) => context.stopLoading(k ? `${key}.${k}` : key),
    };
  }

  return context;
};