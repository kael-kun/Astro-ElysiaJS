import React from "react";

export type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "danger";
export type ButtonSize = "sm" | "md" | "lg" | "xl";

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  fullWidth?: boolean;
};

export function Button({ 
  children, 
  className = "", 
  variant = "primary", 
  size = "md",
  loading = false,
  fullWidth = false,
  disabled,
  ...props 
}: ButtonProps) {
  const baseClasses = "font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center";
  
  const sizeClasses = {
    sm: "py-2 px-3 text-sm",
    md: "py-3 px-4 text-base",
    lg: "py-3 px-6 text-lg",
    xl: "py-4 px-8 text-xl"
  };

  const variantClasses = {
    primary: "bg-red-600 hover:bg-red-700 text-white focus:ring-red-500 shadow-sm hover:shadow-md",
    secondary: "bg-gray-200 hover:bg-gray-300 text-gray-800 focus:ring-gray-500",
    outline: "border border-gray-300 hover:bg-gray-50 text-gray-700 focus:ring-gray-500",
    ghost: "text-red-600 hover:bg-red-50 hover:text-red-700 focus:ring-red-500",
    danger: "bg-red-600 hover:bg-red-700 text-white focus:ring-red-500 shadow-sm hover:shadow-md"
  };

  const widthClasses = fullWidth ? "w-full" : "";

  return (
    <button 
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${widthClasses} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg 
          className="animate-spin -ml-1 mr-2 h-4 w-4" 
          xmlns="http://www.w3.org/2000/svg" 
          fill="none" 
          viewBox="0 0 24 24"
        >
          <circle 
            className="opacity-25" 
            cx="12" 
            cy="12" 
            r="10" 
            stroke="currentColor" 
            strokeWidth="4" 
          />
          <path 
            className="opacity-75" 
            fill="currentColor" 
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" 
          />
        </svg>
      )}
      {children}
    </button>
  );
}
