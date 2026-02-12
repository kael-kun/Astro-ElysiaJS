import React, { useState, useEffect } from "react";
import { UserRole } from "./types/user";

// Define proper types for form submission
interface CreateUserFormData {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}

interface UpdateUserFormData {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

type UserFormData = CreateUserFormData | UpdateUserFormData;

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: UserFormData) => void;
  user?: {
    id: string;
    email: string;
    name: string;
    role: UserRole;
  } | null;
}

export const UserModal: React.FC<UserModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  user,
}) => {
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>(user?.role || "client");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Reset form when modal opens/closes or user changes
  useEffect(() => {
    if (isOpen) {
      setName(user?.name || "");
      setEmail(user?.email || "");
      setPassword("");
      setRole(user?.role || "client");
      setError("");
    }
  }, [isOpen, user]);

  // Close modal on ESC key
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEsc);
    }

    return () => {
      document.removeEventListener("keydown", handleEsc);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validation
    if (!name.trim()) {
      setError("Name is required");
      return;
    }

    if (!email.trim()) {
      setError("Email is required");
      return;
    }

    if (!user && !password) {
      setError("Password is required for new users");
      return;
    }

    if (!user && password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      // Type-safe data construction
      const data: UserFormData = user
        ? { id: user.id, name, email, role }
        : { name, email, password, role };

      await onSubmit(data);
    } catch (err: any) {
      setError(err.message || "Failed to save user");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Background overlay - only renders when isOpen */}
      <div
        className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        ></div>

        {/* Modal panel - perfectly centered */}
        <div 
          className={`inline-block w-full max-w-md transform overflow-hidden rounded-2xl bg-white/90 backdrop-blur-sm border border-white/20 shadow-xl shadow-red-500/10 transition-all ${
            isOpen ? "scale-100 opacity-100" : "scale-95 opacity-0"
          }`}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          <div className="bg-gradient-to-r from-red-600 to-red-700 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex items-center justify-between">
              <h3 id="modal-title" className="text-lg font-bold text-white">
                {user ? "Edit User" : "Add New User"}
              </h3>
              <button
                onClick={onClose}
                className="text-white/90 hover:text-white transition-colors"
                aria-label="Close modal"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="px-6 py-6">
              {error && (
                <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
                  {error}
                </div>
              )}

              <div className="space-y-4">
                {/* Name */}
                <div>
                  <label htmlFor="name" className="mb-2 block text-sm font-medium text-gray-700">
                    Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 bg-white/80 px-4 py-2.5 outline-none transition-all focus:border-red-500 focus:ring-2 focus:ring-red-500/20 backdrop-blur-sm"
                    placeholder="John Doe"
                    required
                    autoFocus
                  />
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="email" className="mb-2 block text-sm font-medium text-gray-700">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 bg-white/80 px-4 py-2.5 outline-none transition-all focus:border-red-500 focus:ring-2 focus:ring-red-500/20 backdrop-blur-sm"
                    placeholder="john@example.com"
                    required
                  />
                </div>

                {/* Password (only for new users) */}
                {!user && (
                  <div>
                    <label htmlFor="password" className="mb-2 block text-sm font-medium text-gray-700">
                      Password <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="password"
                      id="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full rounded-lg border border-gray-300 bg-white/80 px-4 py-2.5 outline-none transition-all focus:border-red-500 focus:ring-2 focus:ring-red-500/20 backdrop-blur-sm"
                      placeholder="••••••••"
                      required
                    />
                    <p className="mt-1 text-xs text-gray-500">Minimum 6 characters</p>
                  </div>
                )}

                {/* Role */}
                <div>
                  <label htmlFor="role" className="mb-2 block text-sm font-medium text-gray-700">
                    Role <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="role"
                    value={role}
                    onChange={(e) => setRole(e.target.value as UserRole)}
                    className="w-full rounded-lg border border-gray-300 bg-white/80 px-4 py-2.5 outline-none transition-all focus:border-red-500 focus:ring-2 focus:ring-red-500/20 backdrop-blur-sm"
                  >
                    <option value="admin">Admin</option>
                    <option value="client">Client</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200/50 bg-gray-50/70 backdrop-blur-sm px-4 py-3.5 sm:flex sm:flex-row-reverse sm:px-6">
              <button
                type="submit"
                disabled={loading}
                className={`inline-flex w-full justify-center rounded-md bg-gradient-to-r from-red-600 to-red-700 px-4 py-2.5 text-base font-bold text-white shadow-sm transition-all hover:from-red-700 hover:to-red-800 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 sm:ml-3 sm:w-auto ${
                  loading ? "cursor-not-allowed opacity-80" : ""
                }`}
              >
                {loading ? (
                  <span className="flex items-center">
                    <svg className="mr-2 h-5 w-5 animate-spin text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </span>
                ) : user ? (
                  "Update User"
                ) : (
                  "Create User"
                )}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white/80 px-4 py-2.5 text-base font-medium text-gray-700 shadow-sm transition-all hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 sm:mt-0 sm:w-auto backdrop-blur-sm"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};