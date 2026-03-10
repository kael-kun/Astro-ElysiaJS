import React from "react";
import { Modal } from "./Modal";
import { ModalHeader } from "./ModalHeader";
import { ModalBody } from "./ModalBody";
import { ModalFooter } from "./ModalFooter";

export interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  confirmVariant?: "primary" | "danger";
  loading?: boolean;
  icon?: React.ReactNode;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirm Action",
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  confirmVariant = "danger",
  loading = false,
  icon,
}) => {
  const defaultIcon = icon || (
    <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
      <svg
        className="h-6 w-6 text-red-600"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
        />
      </svg>
    </div>
  );

  const defaultMessage = message || "Are you sure you want to perform this action? This cannot be undone.";

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="md"
      showCloseButton={false}
      closeOnBackdropClick={!loading}
      closeOnEscape={!loading}
    >
      <ModalHeader title={title} />
      
      <ModalBody>
        <div className="text-center">
          {defaultIcon}
          <div className="mt-4">
            <p className="text-sm text-gray-600">
              {defaultMessage}
            </p>
          </div>
        </div>
      </ModalBody>
      
      <ModalFooter
        confirmText={confirmText}
        cancelText={cancelText}
        confirmVariant={confirmVariant}
        onCancel={onClose}
        onConfirm={onConfirm}
        confirmLoading={loading}
        confirmDisabled={loading}
      />
    </Modal>
  );
};