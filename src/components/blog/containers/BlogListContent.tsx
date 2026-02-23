import { useEffect, useState } from "react";
import { Select } from "../../ui/Select";
import { Card } from "../../ui/Card";
import { BlogTable } from "../components/BlogTable";
import { Button } from "../../ui/Button";
import { Pagination } from "../../ui/Pagination";
import { useProjectSelector } from "../hooks/useProjectSelector";
import { useProjectBlogs } from "../hooks/useProjectBlogs";
import { useAuth } from "src/providers/AuthProvider";

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

  const { projects, loading, error, selectedProjectId, setSelectedProjectId } = useProjectSelector();

  const {
    blogs,
    project,
    loading: blogsLoading,
    error: blogsError,
    page,
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
    setMode("select");
    setInitialProjectId(null);
    setSelectedProjectId(null);
    const url = new URL(window.location.href);
    url.searchParams.delete("projectId");
    url.searchParams.delete("action");
    window.history.pushState({}, "", url.toString());
  };

  const handleGenerateBlog = () => {
    if (selectedProjectId || initialProjectId) {
      const pid = selectedProjectId || initialProjectId;
      window.location.href = `/dashboard/blogs/generate?projectId=${pid}&projectName=${encodeURIComponent(project?.name || "")}`;
    }
  };

  const handlePageChange = (newPage: number) => {
    fetchBlogs(newPage);
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
          <Button onClick={handleGenerateBlog} variant="primary">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Generate New Blog
          </Button>
        </div>

        {blogsError && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">{blogsError}</div>
        )}

        <Card shadow="md" rounded="lg" className="overflow-hidden">
          <BlogTable
            blogs={blogs}
            loading={blogsLoading}
            onDelete={(blog) => deleteBlog(blog.id)}
            showProject={false}
            showOwner={isAdmin}
          />
        </Card>

        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          totalItems={total}
          itemsPerPage={10}
          className="mt-4"
        />
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Generate New Blog</h1>
          <p className="text-gray-500 mt-1">Select a project to generate a new blog</p>
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
    </div>
  );
}
