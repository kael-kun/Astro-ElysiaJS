import React from "react";
import { Input } from "./Input";
import { Select } from "./Select";
import { Textarea } from "./Textarea";
import { LoadingSpinner } from "./LoadingSpinner";

export interface FormFieldProps {
  label: string;
  name: string;
  value: string | number;
  onChange: (value: string) => void;
  type?: "text" | "email" | "password" | "select" | "textarea";
  error?: string;
  helperText?: string;
  required?: boolean;
  placeholder?: string;
  disabled?: boolean;
  loading?: boolean;
  options?: Array<{ value: string; label: string }>;
  className?: string;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  name,
  value,
  onChange,
  type = "text",
  error,
  helperText,
  required = false,
  placeholder,
  disabled = false,
  loading = false,
  options = [],
  className = "",
}) => {
  const baseProps = {
    id: name,
    name,
    value,
    error,
    helperText,
    required,
    placeholder,
    disabled: disabled || loading,
    className,
  };

  if (loading) {
    return (
      <div className="flex items-center space-x-2">
        <LoadingSpinner size="sm" />
        <span className="text-sm text-gray-500">Loading...</span>
      </div>
    );
  }

  switch (type) {
    case "select":
      return (
        <Select
          {...baseProps}
          onChange={(e) => onChange(e.target.value)}
          options={options}
        />
      );
    
    case "textarea":
      return (
        <Textarea
          {...baseProps}
          onChange={(e) => onChange(e.target.value)}
        />
      );
    
    default:
      return (
        <Input
          {...baseProps}
          type={type}
          onChange={(e) => onChange(e.target.value)}
        />
      );
  }
};