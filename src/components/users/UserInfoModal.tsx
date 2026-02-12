import React from "react";
import { User } from "./types/user";

interface UserInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
}

export const UserInfoModal: React.FC<UserInfoModalProps> = ({
  isOpen,
  onClose,
  user,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={onClose}
        ></div>

        {/* Modal panel */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-gradient-to-r from-red-600 to-red-700 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex items-center justify-between">
              <h3
                className="text-lg leading-6 font-medium text-white"
                id="modal-title"
              >
                User Details
              </h3>
              <button
                onClick={onClose}
                className="text-white hover:text-gray-200 transition-colors"
              >
                <svg
                  className="h-6 w-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>

          <div className="px-6 py-6">
            <div className="space-y-6">
              {/* Avatar */}
              <div className="flex justify-center">
                <div className="h-24 w-24 rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center text-white text-3xl font-bold">
                  {user.name.charAt(0).toUpperCase()}
                </div>
              </div>

              {/* User Info */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500">
                    Name
                  </label>
                  <p className="mt-1 text-lg font-semibold text-gray-900">
                    {user.name}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500">
                    Email
                  </label>
                  <p className="mt-1 text-lg font-semibold text-gray-900">
                    {user.email}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500">
                    Role
                  </label>
                  <span
                    className={`mt-1 px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full ${
                      user.role === "admin"
                        ? "bg-red-100 text-red-800"
                        : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                  </span>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500">
                    Member Since
                  </label>
                  <p className="mt-1 text-lg font-semibold text-gray-900">
                    {new Date(user.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500">
                    Last Updated
                  </label>
                  <p className="mt-1 text-lg font-semibold text-gray-900">
                    {new Date(user.updatedAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              onClick={onClose}
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};