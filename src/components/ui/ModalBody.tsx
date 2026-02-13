import React from "react";

export interface ModalBodyProps {
  children: React.ReactNode;
  className?: string;
  padding?: "none" | "sm" | "md" | "lg";
}

export const ModalBody: React.FC<ModalBodyProps> = ({
  children,
  className = "",
  padding = "md",
}) => {
  const paddingClasses = {
    none: "",
    sm: "px-4 py-3",
    md: "px-6 py-6",
    lg: "px-8 py-8",
  };

  return (
    <div className={`${paddingClasses[padding]} ${className}`}>
      {children}
    </div>
  );
};