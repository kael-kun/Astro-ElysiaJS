import React, { useState, useEffect } from "react";
import { FormModal } from "src";
import { Input } from "src";
import type { Project, CreateProjectInput, UpdateProjectInput } from "src/components/projects/types/project";

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateProjectInput | UpdateProjectInput) => Promise<void>;
  project?: Project | null;
  loading?: boolean;
  error?: string;
}

export const ProjectModal: React.FC<ProjectModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  project,
  loading = false,
  error,
}) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) {
      setName(project?.name || "");
      setDescription(project?.description || "");
      setErrors({});
    }
  }, [isOpen, project]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = "Project name is required";
    } else if (name.length > 100) {
      newErrors.name = "Project name must be 100 characters or less";
    }

    if (description.length > 500) {
      newErrors.description = "Description must be 500 characters or less";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const data = project
      ? { id: project.id, name, description: description || undefined }
      : { name, description: description || undefined };

    await onSubmit(data);
  };

  const isEditing = !!project;
  const submitText = isEditing ? "Update Project" : "Create Project";
  const modalTitle = isEditing ? "Edit Project" : "Add New Project";
  const modalDescription = isEditing ? "Update project details" : "Create a new project to organize your blogs";

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={handleSubmit}
      title={modalTitle}
      description={modalDescription}
      submitText={submitText}
      loading={loading}
      submitDisabled={loading}
      gradient
      size="md"
    >
      <div className="space-y-4">
        <Input
          id="name"
          label="Project Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="My Awesome Project"
          required
          error={errors.name}
          autoFocus
          maxLength={100}
          helperText={`${name.length}/100 characters`}
        />

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe your project..."
            rows={3}
            maxLength={500}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-colors"
          />
          <p className="mt-1 text-sm text-gray-500">{description.length}/500 characters</p>
          {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
        </div>

        {error && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">{error}</div>}
      </div>
    </FormModal>
  );
};
