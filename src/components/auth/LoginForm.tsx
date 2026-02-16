import React from "react";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Card } from "../ui/Card";

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
      <Card className="w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
          </div>

          <h1 className="text-2xl font-semibold text-gray-800">Pat CMS</h1>

          <p className="text-gray-500 text-sm mt-2">Sign in to your account</p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">{error}</div>
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

          <Button type="submit" loading={loading} fullWidth size="lg" variant="gradient">
            Sign in
          </Button>
        </form>
      </Card>
    </div>
  );
}
