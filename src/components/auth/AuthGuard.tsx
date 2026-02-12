import React, { useState, useEffect } from "react";
import { LoginForm, LoginPayload } from "./LoginForm";
import { LoadingSpinner } from "../ui/LoadingSpinner";

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
}

export function AuthGuard({ children, requireAuth = true }: AuthGuardProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState<string | undefined>(undefined);

  useEffect(() => {
    // Check if user is authenticated (check token in localStorage/cookies)
    const checkAuth = () => {
      const token = localStorage.getItem('auth-token');
      setIsAuthenticated(!!token);
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const handleLogin = async (payload: LoginPayload) => {
    setIsLoading(true);
    setAuthError(undefined);

    try {
      // Simulate API call - replace with actual authentication
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // For demo, accept any credentials
      if (payload.email && payload.password) {
        localStorage.setItem('auth-token', 'mock-token');
        localStorage.setItem('user-name', 'Alex Morgan');
        setIsAuthenticated(true);
      } else {
        throw new Error('Invalid credentials');
      }
    } catch (err) {
      setAuthError('Invalid email or password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };



  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!requireAuth || isAuthenticated) {
    return <>{children}</>;
  }

  return <LoginForm onSubmit={handleLogin} loading={isLoading} error={authError} />;
}