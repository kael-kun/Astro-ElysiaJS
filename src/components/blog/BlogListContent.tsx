import React, { useState } from "react";
import { BlogTable } from "./BlogTable";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { ConfirmModal } from "../ui/ConfirmModal";
import { Pagination } from "../ui/Pagination";
import { useToast } from "../../hooks/useToast";
import { useProjectBlogs, type Blog } from "./hooks/useProjectBlogs";

export function BlogListContent() {
  const { blogs, project, loading, error, page, totalPages, total, deleteBlog, publishBlog, fetchBlogs } =
    useProjectBlogs();
  const { success, error: showError } = useToast();

  const [blogToDelete, setBlogToDelete] = useState<Blog | null>(null);
  const [deleting, setDeleting] = useState(false);

  const handleGenerateBlog = () => {
    const projectId = new URLSearchParams(window.location.search).get("projectId");
    if (projectId) {
      window.location.href = `/dashboard/blogs/generate?projectId=${projectId}&projectName=${project?.name}`;
    }
  };

  const handleEditBlog = (blog: Blog) => {
    window.location.href = `/dashboard/blogs/edit/${blog.id}`;
  };

  const handleDeleteBlog = (blog: Blog) => {
    setBlogToDelete(blog);
  };

  const handleConfirmDelete = async () => {
    if (!blogToDelete) return;

    try {
      setDeleting(true);
      await deleteBlog(blogToDelete.id);
      success(`Blog has been deleted.`);
      setBlogToDelete(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to delete blog";
      showError(message);
    } finally {
      setDeleting(false);
    }
  };

  const handlePublishBlog = async (blog: Blog) => {
    try {
      await publishBlog(blog.id);
      success(`Blog has been published.`);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to publish blog";
      showError(message);
    }
  };

  const handlePageChange = (newPage: number) => {
    fetchBlogs(newPage);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          {project ? (
            <div>
              <div className="flex items-center space-x-2 mb-3">
                <a href="/dashboard/projects" className="text-sm text-gray-500 hover:text-gray-700 flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Projects
                </a>
              </div>
              <h1 className="text-2xl font-bold text-gray-900">
                Blogs for: <span className="text-red-600">{project.name}</span>
              </h1>
            </div>
          ) : (
            <div>
              <h1 className="text-2xl font-bold text-gray-900">All Blogs</h1>
              <p className="text-gray-500 mt-1">Manage your blog content</p>
            </div>
          )}
        </div>
        {project && (
          <Button onClick={handleGenerateBlog} variant="primary">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Generate New Blog
          </Button>
        )}
      </div>

      {error && <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">{error}</div>}

      <Card shadow="md" rounded="lg" className="overflow-hidden">
        <BlogTable
          blogs={blogs}
          loading={loading}
          onEdit={handleEditBlog}
          onDelete={handleDeleteBlog}
          onPublish={handlePublishBlog}
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

      <ConfirmModal
        isOpen={!!blogToDelete}
        onClose={() => setBlogToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Blog"
        message={
          <span>
            Are you sure you want to delete the blog{" "}
            <span className="font-semibold text-gray-900">"{blogToDelete?.meta_description || "Untitled"}"</span>? This
            action cannot be undone.
          </span>
        }
        confirmText="Delete"
        loading={deleting}
      />
    </div>
  );
}
