import React from "react";

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string;
  id: string;
  error?: string;
  helperText?: string;
  required?: boolean;
  resize?: "none" | "vertical" | "horizontal" | "both";
  showCharCount?: boolean;
  maxLength?: number;
};

export function Textarea({ 
  label, 
  id, 
  className = "", 
  error,
  helperText,
  required = false,
  resize = "vertical",
  showCharCount = false,
  maxLength,
  value,
  onChange,
  ...props 
}: TextareaProps) {
  const baseClasses = "w-full px-4 py-3 rounded-lg border transition-all duration-200 outline-none placeholder:text-gray-400";
  const stateClasses = error
    ? "border-red-300 focus:ring-2 focus:ring-red-500 focus:border-red-500"
    : "border-gray-200 focus:ring-2 focus:ring-red-500 focus:border-red-500";
  const resizeClasses = {
    none: "resize-none",
    vertical: "resize-y",
    horizontal: "resize-x",
    both: "resize"
  };

  const charCount = value?.toString().length || 0;

  return (
    <div className="w-full">
      {label && (
        <label 
          htmlFor={id} 
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <textarea
        id={id}
        className={`${baseClasses} ${stateClasses} ${resizeClasses[resize]} ${className}`}
        aria-invalid={error ? "true" : "false"}
        aria-describedby={error ? `${id}-error` : helperText ? `${id}-helper` : undefined}
        maxLength={maxLength}
        value={value}
        onChange={onChange}
        {...props}
      />
      
      {(showCharCount || maxLength) && (
        <div className="mt-1 text-sm text-gray-500 text-right">
          {showCharCount && `${charCount}`}
          {maxLength && ` / ${maxLength}`}
        </div>
      )}
      
      {error && (
        <p id={`${id}-error`} className="mt-1 text-sm text-red-600">
          {error}
        </p>
      )}
      
      {helperText && !error && (
        <p id={`${id}-helper`} className="mt-1 text-sm text-gray-500">
          {helperText}
        </p>
      )}
    </div>
  );
}