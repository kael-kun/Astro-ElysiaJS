import React from "react";
import { Button } from "./Button";

export interface ModalFooterProps {
  children?: React.ReactNode;
  className?: string;
  align?: "left" | "center" | "right" | "between";
  cancelText?: string;
  confirmText?: string;
  onCancel?: () => void;
  onConfirm?: () => void;
  confirmDisabled?: boolean;
  confirmLoading?: boolean;
  confirmVariant?: "primary" | "danger";
}

export const ModalFooter: React.FC<ModalFooterProps> = ({
  children,
  className = "",
  align = "right",
  cancelText = "Cancel",
  confirmText = "Confirm",
  onCancel,
  onConfirm,
  confirmDisabled = false,
  confirmLoading = false,
  confirmVariant = "primary",
}) => {
  const alignClasses = {
    left: "justify-start",
    center: "justify-center",
    right: "justify-end",
    between: "justify-between",
  };

  const baseClasses = "border-t border-gray-200/50 bg-gray-50/70 backdrop-blur-sm px-6 py-4 flex items-center gap-2";

  if (children) {
    return <div className={`${baseClasses} ${alignClasses[align]} ${className}`}>{children}</div>;
  }

  return (
    <div className={`${baseClasses} ${alignClasses[align]} ${className}`}>
      <Button
        variant={confirmVariant}
        onClick={onConfirm}
        disabled={confirmDisabled}
        loading={confirmLoading}
        className="sm:w-auto"
      >
        {confirmText}
      </Button>

      {onCancel && (
        <Button variant="outline" onClick={onCancel} className="mt-3 sm:mt-0 sm:w-auto">
          {cancelText}
        </Button>
      )}
    </div>
  );
};
