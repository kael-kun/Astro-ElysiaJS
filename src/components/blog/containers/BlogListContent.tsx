import { useEffect, useState } from "react";
import { Select } from "../../ui/Select";
import { Card } from "../../ui/Card";
import { BlogCardList } from "../components/BlogCardList";
import { Button } from "../../ui/Button";
import { Pagination } from "../../ui/Pagination";
import { ConfirmModal } from "../../ui/ConfirmModal";
import { useProjectSelector } from "../hooks/useProjectSelector";
import { useProjectBlogs, type Blog } from "../hooks/useProjectBlogs";
import { useAuth } from "src/providers/AuthProvider";
import { ApiIntegrationModal } from "../components/ApiIntegrationModal";
import { useToastContext } from "src/providers/ToastProvider";

function getModeFromURL(): "select" | "list" {
  if (typeof window === "undefined") return "select";
  const params = new URLSearchParams(window.location.search);
  return params.get("action") === "list" ? "list" : "select";
}

function getProjectIdFromURL(): string | null {
  if (typeof window === "undefined") return null;
  const params = new URLSearchParams(window.location.search);
  return params.get("projectId");
}

export function BlogListContent() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  const [mode, setMode] = useState<"select" | "list">("select");
  const [initialProjectId, setInitialProjectId] = useState<string | null>(null);
  const [isApiModalOpen, setIsApiModalOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [blogToDelete, setBlogToDelete] = useState<Blog | null>(null);
  const [modalLoading, setModalLoading] = useState(false);

  const { error: showError, success: showSuccess } = useToastContext();

  const { projects, loading, error, selectedProjectId, setSelectedProjectId } = useProjectSelector();

  const {
    blogs,
    project,
    loading: blogsLoading,
    error: blogsError,
    page,
    limit,
    totalPages,
    total,
    deleteBlog,
    fetchBlogs,
  } = useProjectBlogs();

  useEffect(() => {
    const urlMode = getModeFromURL();
    const urlProjectId = getProjectIdFromURL();

    setMode(urlMode);
    if (urlProjectId) {
      setInitialProjectId(urlProjectId);
    }
  }, []);

  useEffect(() => {
    if (mode === "select" && selectedProjectId) {
      const project = projects.find((p) => p.id === selectedProjectId);
      if (project) {
        window.location.href = `/dashboard/blogs/generate?projectId=${project.id}&projectName=${encodeURIComponent(project.name)}`;
      }
    }
  }, [selectedProjectId, projects, mode]);

  useEffect(() => {
    if (mode === "list" && initialProjectId) {
      fetchBlogs();
    }
  }, [mode, initialProjectId, fetchBlogs]);

  const handleProjectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (value) {
      setSelectedProjectId(value);
      setMode("select");
    }
  };

  const handleBackToSelect = () => {
    window.location.href = "/dashboard/projects";
  };

  const handleGenerateBlog = () => {
    if (selectedProjectId || initialProjectId) {
      const pid = selectedProjectId || initialProjectId;
      window.location.href = `/dashboard/blogs/generate?projectId=${pid}&projectName=${encodeURIComponent(project?.name || "")}&mode=generate`;
    }
  };

  const handleCreateManually = () => {
    if (selectedProjectId || initialProjectId) {
      const pid = selectedProjectId || initialProjectId;
      window.location.href = `/dashboard/blogs/generate?projectId=${pid}&projectName=${encodeURIComponent(project?.name || "")}&mode=manual`;
    }
  };

  const handlePageChange = (newPage: number) => {
    fetchBlogs(newPage);
  };

  const handleDeleteBlog = (blog: Blog) => {
    setBlogToDelete(blog);
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    if (!blogToDelete) return;

    try {
      setModalLoading(true);
      await deleteBlog(blogToDelete.id);
      showSuccess(`Blog "${blogToDelete.title || 'Untitled'}" has been deleted successfully.`);
      setShowDeleteConfirm(false);
      setBlogToDelete(null);
    } catch (err: any) {
      showError(err.message || "Failed to delete blog");
    } finally {
      setModalLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-gray-500">Loading projects...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">{error}</div>
      </div>
    );
  }

  const dropdownOptions = projects.map((project) => {
    const label = isAdmin && project.user_name ? `${project.name} (${project.user_name})` : project.name;
    return { value: project.id, label };
  });

  if (mode === "list" && initialProjectId) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center space-x-2 mb-3">
              <button onClick={handleBackToSelect} className="text-sm text-gray-500 hover:text-gray-700">
                ← Back to Projects
              </button>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">
              Blogs for: <span className="text-red-600">{project?.name}</span>
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              onClick={() => setIsApiModalOpen(true)} 
              variant="secondary"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
              API Integration
            </Button>
            <Button onClick={handleCreateManually} variant="outline">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Create Manually
            </Button>
            <Button onClick={handleGenerateBlog} variant="primary">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Generate with AI
            </Button>
          </div>
        </div>

        {blogsError && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">{blogsError}</div>
        )}

        <BlogCardList
          blogs={blogs}
          loading={blogsLoading}
          onDelete={handleDeleteBlog}
          showOwner={isAdmin}
        />

        {blogs.length > 0 && (
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            totalItems={total}
            itemsPerPage={limit}
            className="mt-8"
          />
        )}

        <ApiIntegrationModal
          isOpen={isApiModalOpen}
          onClose={() => setIsApiModalOpen(false)}
          projectId={initialProjectId || ""}
          projectName={project?.name || ""}
        />

        <ConfirmModal
          isOpen={showDeleteConfirm}
          onClose={() => {
            setShowDeleteConfirm(false);
            setBlogToDelete(null);
          }}
          onConfirm={handleConfirmDelete}
          title="Delete Blog"
          message={
            <span>
              Are you sure you want to delete <span className="font-semibold text-gray-900">{blogToDelete?.title || "Untitled Blog"}</span>?
              This action cannot be undone.
            </span>
          }
          confirmText="Delete"
          loading={modalLoading}
        />
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Create New Blog</h1>
          <p className="text-gray-500 mt-1">Select a project and choose how to create your blog</p>
        </div>
      </div>

      <Card shadow="md" rounded="lg" className="max-w-md mx-auto mt-8">
        <div className="p-6">
          <Select
            id="project-select"
            label="Choose a Project"
            placeholder="Select a project..."
            options={dropdownOptions}
            value={selectedProjectId || ""}
            onChange={handleProjectChange}
          />

          {projects.length === 0 && (
            <p className="mt-4 text-sm text-gray-500 text-center">
              No projects found.{" "}
              <a href="/dashboard/projects" className="text-red-600 hover:underline">
                Create a project first
              </a>
            </p>
          )}
        </div>
      </Card>

      <ApiIntegrationModal
        isOpen={isApiModalOpen}
        onClose={() => setIsApiModalOpen(false)}
        projectId={selectedProjectId || ""}
        projectName={projects.find(p => p.id === selectedProjectId)?.name || ""}
      />

      <ConfirmModal
        isOpen={showDeleteConfirm}
        onClose={() => {
          setShowDeleteConfirm(false);
          setBlogToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Delete Blog"
        message={
          <span>
            Are you sure you want to delete <span className="font-semibold text-gray-900">{blogToDelete?.title || "Untitled Blog"}</span>?
            This action cannot be undone.
          </span>
        }
        confirmText="Delete"
        loading={modalLoading}
      />
    </div>
  );
}
