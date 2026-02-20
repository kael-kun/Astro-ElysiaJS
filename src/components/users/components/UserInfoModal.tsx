import React from "react";
import { Modal, ModalHeader, ModalBody, ModalFooter, Button } from "src";
import type { User } from "src/components/users/types/user";

interface UserInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
}

export const UserInfoModal: React.FC<UserInfoModalProps> = ({ isOpen, onClose, user }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const roleClass = user.role === "admin" ? "bg-red-100 text-red-800" : "bg-blue-100 text-blue-800";

  const infoItems = [
    { label: "Name", value: user.name },
    { label: "Email", value: user.email },
    { label: "Role", value: user.role.charAt(0).toUpperCase() + user.role.slice(1), isTag: true, tagClass: roleClass },
    { label: "Member Since", value: formatDate(user.createdAt) },
    { label: "Last Updated", value: formatDate(user.updatedAt) },
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <ModalHeader title="User Details" gradient />

      <ModalBody>
        <div className="space-y-6">
          {/* Avatar */}
          <div className="flex justify-center">
            <div className="h-24 w-24 rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center text-white text-3xl font-bold">
              {user.name.charAt(0).toUpperCase()}
            </div>
          </div>

          {/* User Info */}
          <div className="space-y-4">
            {infoItems.map((item) => (
              <div key={item.label}>
                <label className="block text-sm font-medium text-gray-500">{item.label}</label>
                {item.isTag ? (
                  <span
                    className={`mt-1 px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full ${item.tagClass}`}
                  >
                    {item.value}
                  </span>
                ) : (
                  <p className="mt-1 text-lg font-semibold text-gray-900">{item.value}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </ModalBody>

      <ModalFooter>
        <Button variant="primary" onClick={onClose}>
          Close
        </Button>
      </ModalFooter>
    </Modal>
  );
};
