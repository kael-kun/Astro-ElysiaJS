import React from "react";
import { Modal } from "./Modal";
import { ModalHeader } from "./ModalHeader";
import { ModalBody } from "./ModalBody";
import { ModalFooter } from "./ModalFooter";

export interface FormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  submitText?: string;
  cancelText?: string;
  loading?: boolean;
  submitDisabled?: boolean;
  gradient?: boolean;
  size?: "sm" | "md" | "lg" | "xl";
  formId?: string;
}

export const FormModal: React.FC<FormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  title,
  description,
  children,
  submitText = "Save",
  cancelText = "Cancel",
  loading = false,
  submitDisabled = false,
  gradient = false,
  size = "md",
  formId = "modal-form",
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size={size}
      closeOnBackdropClick={!loading}
      closeOnEscape={!loading}
    >
      <ModalHeader
        title={title}
        description={description}
        gradient={gradient}
      />
      
      <form id={formId} onSubmit={onSubmit}>
        <ModalBody>
          {children}
        </ModalBody>
        
        <ModalFooter
          confirmText={submitText}
          cancelText={cancelText}
          onCancel={onClose}
          onConfirm={() => {
            const form = document.getElementById(formId) as HTMLFormElement;
            form?.requestSubmit();
          }}
          confirmLoading={loading}
          confirmDisabled={submitDisabled || loading}
        />
      </form>
    </Modal>
  );
};