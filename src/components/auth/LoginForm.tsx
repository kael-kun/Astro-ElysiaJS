import React from "react";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";

export interface LoginPayload {
  email: string;
  password: string;
}

interface LoginFormProps {
  onSubmit?: (payload: LoginPayload) => void;
  loading?: boolean;
  error?: string;
}

export function LoginForm({ onSubmit, loading = false, error }: LoginFormProps) {
  const handleSubmit = (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();

    const form = e.currentTarget;
    const data = new FormData(form);

    const payload: LoginPayload = {
      email: String(data.get("email") || ""),
      password: String(data.get("password") || ""),
    };

    if (onSubmit) {
      onSubmit(payload);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <div className="text-center mb-8">
          <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
          </div>

          <h1 className="text-2xl font-semibold text-gray-800">Pat CMS – Powerful Content Management Made Easy</h1>

          <p className="text-gray-500 text-sm mt-3">Sign in to your account</p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
            {error}
          </div>
        )}

        <form className="space-y-5" onSubmit={handleSubmit} noValidate>
          <Input
            id="email"
            name="email"
            type="email"
            label="Email address"
            placeholder="Email address"
            required
            autoComplete="email"
          />

          <Input
            id="password"
            name="password"
            type="password"
            label="Password"
            placeholder="Password"
            required
            autoComplete="current-password"
          />

          <div className="flex items-center justify-between">
            <label className="flex items-center">
              <input
                type="checkbox"
                name="remember"
                className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
              />
              <span className="ml-2 block text-sm text-gray-700">Remember me</span>
            </label>
            <a href="/forgot-password" className="text-sm text-red-600 hover:text-red-500">
              Forgot password?
            </a>
          </div>

          <Button 
            type="submit" 
            loading={loading}
            fullWidth
            size="lg"
          >
            Sign in
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Don't have an account?{" "}
            <a href="/register" className="text-red-600 hover:text-red-500 font-medium">
              Sign up
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}