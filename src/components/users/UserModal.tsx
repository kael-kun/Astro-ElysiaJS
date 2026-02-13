import React, { useState, useEffect } from "react";
import { FormModal } from "../ui/FormModal";
import { Input } from "../ui/Input";
import { Select } from "../ui/Select";
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
  loading?: boolean;
  error?: string;
}

export const UserModal: React.FC<UserModalProps> = ({ isOpen, onClose, onSubmit, user, loading = false, error }) => {
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>(user?.role || "client");
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Reset form when modal opens/closes or user changes
  useEffect(() => {
    if (isOpen) {
      setName(user?.name || "");
      setEmail(user?.email || "");
      setPassword("");
      setRole(user?.role || "client");
      setErrors({});
    }
  }, [isOpen, user]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!user && !password) {
      newErrors.password = "Password is required for new users";
    } else if (!user && password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      // Type-safe data construction
      const data: UserFormData = user ? { id: user.id, name, email, role } : { name, email, password, role };

      await onSubmit(data);
    } catch (err: any) {
      throw err;
    }
  };

  const isEditing = !!user;
  const submitText = isEditing ? "Update User" : "Create User";
  const description = isEditing ? "Update user information and permissions" : "Add a new user to the system";

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={handleSubmit}
      title={isEditing ? "Edit User" : "Add New User"}
      description={description}
      submitText={submitText}
      loading={loading}
      submitDisabled={loading}
      gradient
      size="md"
    >
      <div className="space-y-4">
        <Input
          id="name"
          label="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="John Doe"
          required
          error={errors.name}
          autoFocus
        />

        <Input
          id="email"
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="john@example.com"
          required
          error={errors.email}
        />

        {!user && (
          <Input
            id="password"
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            error={errors.password}
            helperText="Minimum 6 characters"
          />
        )}

        <Select
          id="role"
          label="Role"
          value={role}
          onChange={(e) => setRole(e.target.value as UserRole)}
          options={[
            { value: "client", label: "Client" },
            { value: "admin", label: "Admin" },
          ]}
          required
        />

        {error && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">{error}</div>}
      </div>
    </FormModal>
  );
};
