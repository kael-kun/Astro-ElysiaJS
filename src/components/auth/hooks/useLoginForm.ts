import { useState, useCallback, useMemo } from "react";
import apiClient from "src/services/apiClient";
import { getApiErrorMessage } from "src/services/apiError";
import { useAuth } from "src/providers/AuthProvider";
import { useToastContext } from "src/providers/ToastProvider";
import type { LoginResponse, UseLoginFormReturn } from "src/types/auth";

interface FieldErrors {
  email?: string;
  password?: string;
}

export function useLoginForm(): UseLoginFormReturn {
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const { login: setAuth } = useAuth();
  const { error: showError, success: showSuccess } = useToastContext();

  const validate = useCallback((email: string, password: string): FieldErrors => {
    const errors: FieldErrors = {};

    if (!email) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = "Invalid email format";
    }

    if (!password) {
      errors.password = "Password is required";
    } else if (password.length < 6) {
      errors.password = "Password must be at least 6 characters";
    }

    return errors;
  }, []);

  const login = useCallback(
    async (email: string, password: string): Promise<boolean> => {
      const errors = validate(email, password);

      if (Object.keys(errors).length > 0) {
        setFieldErrors(errors);
        return false;
      }

      setLoading(true);
      setFieldErrors({});

      try {
        const response = await apiClient.post<LoginResponse>("/api/login", {
          email,
          password,
        });

        const { token, user } = response.data;

        setAuth(user, token);
        window.location.href = "/dashboard";

        return true;
      } catch (err) {
        const message = getApiErrorMessage(err);
        setFieldErrors({ password: message });
        showError(message);

        return false;
      } finally {
        setLoading(false);
      }
    },
    [validate, setAuth, showError, showSuccess],
  );

  const handleSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      const form = e.currentTarget;
      const formData = new FormData(form);

      const email = String(formData.get("email") || "").trim();
      const password = String(formData.get("password") || "");

      login(email, password);
    },
    [login],
  );

  const formProps = useMemo(
    () => ({
      onSubmit: handleSubmit,
    }),
    [handleSubmit],
  );

  const fieldProps = useMemo(
    () => ({
      email: {
        id: "email",
        name: "email",
        type: "email",
        label: "Email address",
        placeholder: "Email address",
        required: true,
        autoComplete: "email",
        error: fieldErrors.email,
      },
      password: {
        id: "password",
        name: "password",
        type: "password",
        label: "Password",
        placeholder: "Password",
        required: true,
        autoComplete: "current-password",
        error: fieldErrors.password,
      },
    }),
    [fieldErrors],
  );

  const buttonProps = useMemo(
    () => ({
      type: "submit" as const,
      loading,
      fullWidth: true,
      size: "lg" as const,
      variant: "gradient" as const,
      children: "Sign in",
    }),
    [loading],
  );

  return {
    formProps,
    fieldProps,
    buttonProps,
    error: fieldErrors.password ?? null,
  };
}
