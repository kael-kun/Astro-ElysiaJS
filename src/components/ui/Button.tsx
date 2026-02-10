import React from "react";

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "ghost";
};

export function Button({ children, className = "", variant = "primary", ...props }: ButtonProps) {
  const base = "font-medium py-3 px-4 rounded-lg transition duration-200 shadow-sm";
  const variantClasses =
    variant === "primary"
      ? "w-full bg-red-600 hover:bg-red-700 text-white cursor-pointer"
      : "text-red-600 hover:text-red-700 bg-transparent cursor-pointer";
  return (
    <button className={`${base} ${variantClasses} ${className}`} {...props}>
      {children}
    </button>
  );
}
