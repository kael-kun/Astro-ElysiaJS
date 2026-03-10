import React from "react";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  id: string;
  error?: string;
  helperText?: string;
  required?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
};

export function Input({ 
  label, 
  id, 
  className = "", 
  error,
  helperText,
  required = false,
  leftIcon,
  rightIcon,
  ...props 
}: InputProps) {
  const baseClasses = "w-full px-4 py-3 rounded-lg border transition-all duration-200 outline-none placeholder:text-gray-400";
  const stateClasses = error
    ? "border-red-300 focus:ring-2 focus:ring-red-500 focus:border-red-500"
    : "border-gray-200 focus:ring-2 focus:ring-red-500 focus:border-red-500";
  const iconPadding = leftIcon ? "pl-10" : rightIcon ? "pr-10" : "";

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
      
      <div className="relative">
        {leftIcon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            {leftIcon}
          </div>
        )}
        
        <input
          id={id}
          className={`${baseClasses} ${stateClasses} ${iconPadding} ${className}`}
          aria-invalid={error ? "true" : "false"}
          aria-describedby={error ? `${id}-error` : helperText ? `${id}-helper` : undefined}
          {...props}
        />
        
        {rightIcon && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            {rightIcon}
          </div>
        )}
      </div>
      
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
