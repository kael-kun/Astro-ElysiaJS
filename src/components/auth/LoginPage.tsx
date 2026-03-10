import { memo } from "react";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Card } from "../ui/Card";
import { useLoginForm } from "./hooks/useLoginForm";
export const LoginPage = memo(function LoginPage() {
  const { formProps, fieldProps, buttonProps, error } = useLoginForm();

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

        <form className="space-y-5" {...formProps} noValidate>
          <Input
            id={fieldProps.email.id}
            name={fieldProps.email.name}
            type={fieldProps.email.type}
            label={fieldProps.email.label}
            placeholder={fieldProps.email.placeholder}
            required={fieldProps.email.required}
            autoComplete={fieldProps.email.autoComplete}
            error={fieldProps.email.error}
          />

          <Input
            id={fieldProps.password.id}
            name={fieldProps.password.name}
            type={fieldProps.password.type}
            label={fieldProps.password.label}
            placeholder={fieldProps.password.placeholder}
            required={fieldProps.password.required}
            autoComplete={fieldProps.password.autoComplete}
            error={fieldProps.password.error}
          />

          <Button {...buttonProps} />
        </form>
      </Card>
    </div>
  );
});

LoginPage.displayName = "LoginPage";
