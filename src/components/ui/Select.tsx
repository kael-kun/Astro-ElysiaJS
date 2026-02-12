import React from "react";

export type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string;
  id: string;
  error?: string;
  helperText?: string;
  required?: boolean;
  options: { value: string; label: string }[];
  placeholder?: string;
};

export function Select({ 
  label, 
  id, 
  className = "", 
  error,
  helperText,
  required = false,
  options,
  placeholder,
  value,
  ...props 
}: SelectProps) {
  const baseClasses = "w-full px-4 py-3 rounded-lg border transition-all duration-200 outline-none bg-white cursor-pointer";
  const stateClasses = error
    ? "border-red-300 focus:ring-2 focus:ring-red-500 focus:border-red-500"
    : "border-gray-200 focus:ring-2 focus:ring-red-500 focus:border-red-500";

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
      
      <select
        id={id}
        className={`${baseClasses} ${stateClasses} ${className}`}
        aria-invalid={error ? "true" : "false"}
        aria-describedby={error ? `${id}-error` : helperText ? `${id}-helper` : undefined}
        value={value}
        {...props}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      
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