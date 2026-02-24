import React, { useEffect } from "react";
import { X } from "lucide-react";

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
  showCloseButton?: boolean;
  closeOnBackdropClick?: boolean;
  closeOnEscape?: boolean;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  children,
  size = "md",
  showCloseButton = true,
  closeOnBackdropClick = true,
  closeOnEscape = true,
}) => {
  // Close modal on ESC key
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape" && closeOnEscape) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEsc);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose, closeOnEscape]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: "max-w-md",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
  };

  return (
    <>
      {/* Backdrop overlay */}
      <div
        className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm"
          onClick={closeOnBackdropClick ? onClose : undefined}
          data-testid="modal-backdrop"
        />

        {/* Modal panel */}
        <div 
          className={`relative block w-full ${sizeClasses[size]} max-h-[85vh] overflow-hidden transform rounded-2xl bg-white/90 backdrop-blur-sm border border-white/20 shadow-xl shadow-red-500/10 transition-all ${
            isOpen ? "scale-100 opacity-100" : "scale-95 opacity-0"
          }`}
          role="dialog"
          aria-modal="true"
          onClick={(e) => e.stopPropagation()}
        >
          {showCloseButton && (
            <button
              onClick={onClose}
              className="absolute right-4 top-4 z-10 p-1 rounded-full hover:bg-gray-200/50 transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          )}
          <div className="overflow-y-auto max-h-[85vh]">
            {children}
          </div>
        </div>
      </div>
    </>
  );
};