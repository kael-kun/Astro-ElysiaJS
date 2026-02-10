import React from "react";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  id: string;
};

export function Input({ label, id, className = "", ...props }: InputProps) {
  return (
    <div>
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <input
        id={id}
        {...props}
        className={`w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-gray-500 focus:border-transparent transition ${className}`}
      />
    </div>
  );
}
