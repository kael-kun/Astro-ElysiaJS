import React, { useState } from "react";
import { Card } from "../ui/Card";
import { Button } from "../ui/Button";
import { Table, Column } from "../ui/Table";
import { Pagination } from "../ui/Pagination";
import { ProjectModal } from "./ProjectModal";
import { ProjectActions } from "./ProjectActions";
import { ConfirmModal } from "../ui/ConfirmModal";
import { useProjects } from "./hooks/useProjects";
import { useToast } from "../../hooks/useToast";
import type { Project, CreateProjectInput, UpdateProjectInput } from "./types/project";

export function ProjectsContent() {
  const {
    projects,
    loading,
    error,
    page,
    totalPages,
    totalProjects,
    itemsPerPage,
    createProject,
    updateProject,
    deleteProject,
    setPage,
  } = useProjects();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  const { success, error: showError } = useToast();

  const handleAddProject = () => {
    setEditingProject(null);
    setModalError(null);
    setIsModalOpen(true);
  };

  const handleEditProject = (project: Project) => {
    setEditingProject(project);
    setModalError(null);
    setIsModalOpen(true);
  };

  const handleDeleteProject = (project: Project) => {
    setProjectToDelete(project);
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    if (!projectToDelete) return;

    try {
      setModalLoading(true);
      await deleteProject(projectToDelete.id);
      success(`Project "${projectToDelete.name}" has been deleted.`);
      setShowDeleteConfirm(false);
      setProjectToDelete(null);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to delete project";
      showError(message);
    } finally {
      setModalLoading(false);
    }
  };

  const handleViewBlogs = (project: Project) => {
    window.location.href = `/dashboard/blog?projectId=${project.id}`;
  };

  const handleSubmit = async (data: CreateProjectInput | UpdateProjectInput) => {
    try {
      setModalLoading(true);
      setModalError(null);

      if (editingProject) {
        await updateProject(data as UpdateProjectInput & { id: string });
        success(`Project has been updated successfully.`);
      } else {
        await createProject(data as CreateProjectInput);
        success(`Project has been created successfully.`);
      }

      setIsModalOpen(false);
      setEditingProject(null);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to save project. Please try again.";
      setModalError(message);
      throw err;
    } finally {
      setModalLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const renderActions = (_value: unknown, project: Project, _index: number) => (
    <ProjectActions
      onViewBlogs={() => handleViewBlogs(project)}
      onEdit={() => handleEditProject(project)}
      onDelete={() => handleDeleteProject(project)}
    />
  );

  const columns: Column<Project>[] = [
    {
      key: "name",
      label: "Project Name",
      sortable: true,
    },
    {
      key: "description",
      label: "Description",
      render: (value) => (
        <span className="text-gray-500">
          {value || "No description"}
        </span>
      ),
    },
    {
      key: "createdAt",
      label: "Created",
      sortable: true,
      render: (value) => formatDate(value as string),
    },
    {
      key: "actions",
      label: "Actions",
      align: "right",
      render: renderActions,
    },
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
          <p className="text-gray-500 mt-1">Manage your projects and organize your blogs</p>
        </div>
        <Button onClick={handleAddProject} variant="primary">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Project
        </Button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">{error}</div>
      )}

      <Card shadow="md" rounded="lg" className="overflow-hidden">
        <Table<Project>
          data={projects}
          columns={columns}
          loading={loading}
          keyField="id"
        />

        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={setPage}
          totalItems={totalProjects}
          itemsPerPage={itemsPerPage}
        />
      </Card>

      <ProjectModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingProject(null);
          setModalError(null);
        }}
        onSubmit={handleSubmit}
        project={editingProject}
        loading={modalLoading}
        error={modalError || undefined}
      />

      <ConfirmModal
        isOpen={showDeleteConfirm}
        onClose={() => {
          setShowDeleteConfirm(false);
          setProjectToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Delete Project"
        message={
          <span>
            Are you sure you want to delete{" "}
            <span className="font-semibold text-gray-900">{projectToDelete?.name}</span>?
            This action cannot be undone.
          </span>
        }
        confirmText="Delete"
        loading={modalLoading}
      />
    </div>
  );
}
