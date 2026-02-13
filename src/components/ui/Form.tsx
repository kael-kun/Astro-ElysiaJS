import React, { useState, useCallback } from "react";
import { Button } from "./Button";
import { Input } from "./Input";
import { Select } from "./Select";
import { Textarea } from "./Textarea";

export interface FormFieldConfig {
  name: string;
  label: string;
  type?: "text" | "email" | "password" | "select" | "textarea";
  required?: boolean;
  placeholder?: string;
  options?: Array<{ value: string; label: string }>;
  validation?: {
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
    custom?: (value: string) => string | null;
  };
}

export interface FormProps<T extends Record<string, any>> {
  fields: FormFieldConfig[];
  values: T;
  onChange: (values: T) => void;
  onSubmit: (values: T) => void | Promise<void>;
  loading?: boolean;
  submitText?: string;
  cancelText?: string;
  onCancel?: () => void;
  submitDisabled?: boolean;
  className?: string;
}

export function Form<T extends Record<string, any>>({
  fields,
  values,
  onChange,
  onSubmit,
  loading = false,
  submitText = "Submit",
  cancelText = "Cancel",
  onCancel,
  submitDisabled = false,
  className = "",
}: FormProps<T>) {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateField = useCallback((field: FormFieldConfig, value: string): string | null => {
    if (!field.validation) return null;

    const { validation } = field;

    // Required validation
    if (field.required && (!value || value.trim() === "")) {
      return `${field.label} is required`;
    }

    // Skip other validations if field is empty and not required
    if (!value || value.trim() === "") return null;

    // Minimum length validation
    if (validation.minLength && value.length < validation.minLength) {
      return `${field.label} must be at least ${validation.minLength} characters`;
    }

    // Maximum length validation
    if (validation.maxLength && value.length > validation.maxLength) {
      return `${field.label} must be no more than ${validation.maxLength} characters`;
    }

    // Pattern validation (like email)
    if (validation.pattern && !validation.pattern.test(value)) {
      if (field.type === "email") {
        return "Please enter a valid email address";
      }
      return `${field.label} is not in the correct format`;
    }

    // Custom validation
    if (validation.custom) {
      return validation.custom(value);
    }

    return null;
  }, []);

  const validateForm = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};

    fields.forEach((field) => {
      const value = values[field.name] || "";
      const error = validateField(field, value);
      
      if (error) {
        newErrors[field.name] = error;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [fields, values, validateField]);

  const handleFieldChange = useCallback((name: string, value: string) => {
    const newValues = { ...values, [name]: value };
    onChange(newValues);

    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  }, [values, onChange, errors]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      await onSubmit(values);
    } catch (err) {
      console.error("Form submission error:", err);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={`space-y-4 ${className}`}>
      {fields.map((field) => {
        const value = values[field.name] || "";
        const error = errors[field.name];

        return (
          <div key={field.name}>
            {field.type === "select" ? (
              <Select
                id={field.name}
                name={field.name}
                label={field.label}
                value={value}
                onChange={(e) => handleFieldChange(field.name, e.target.value)}
                options={field.options || []}
                placeholder={field.placeholder}
                error={error}
                required={field.required}
                disabled={loading}
              />
            ) : field.type === "textarea" ? (
              <Textarea
                id={field.name}
                name={field.name}
                label={field.label}
                value={value}
                onChange={(e) => handleFieldChange(field.name, e.target.value)}
                placeholder={field.placeholder}
                error={error}
                required={field.required}
                disabled={loading}
              />
            ) : (
              <Input
                id={field.name}
                name={field.name}
                type={field.type || "text"}
                label={field.label}
                value={value}
                onChange={(e) => handleFieldChange(field.name, e.target.value)}
                placeholder={field.placeholder}
                error={error}
                required={field.required}
                disabled={loading}
              />
            )}
          </div>
        );
      })}

      <div className="flex justify-end space-x-3 pt-4">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={loading}
          >
            {cancelText}
          </Button>
        )}
        
        <Button
          type="submit"
          loading={loading}
          disabled={submitDisabled || loading}
        >
          {submitText}
        </Button>
      </div>
    </form>
  );
}