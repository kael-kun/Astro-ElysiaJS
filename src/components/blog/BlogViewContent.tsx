import React, { useState, useEffect, useCallback } from "react";
import { Button } from "../ui/Button";
import apiClient from "../../services/apiClient";
import { useToast } from "../../hooks/useToast";

interface BlogData {
  id: string;
  title: string | null;
  description: string | null;
  content: string | null;
  meta_description: string | null;
  status: "draft" | "published";
  image_url: string | null;
  project_id: string | null;
  createdAt: string;
  updatedAt: string;
}

interface BlogViewContentProps {
  blogId: string;
}

export function BlogViewContent({ blogId }: BlogViewContentProps) {
  const [blog, setBlog] = useState<BlogData | null>(null);
  const [loading, setLoading] = useState(true);

  const { error: showError } = useToast();

  const fetchBlog = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiClient.get<BlogData>(`/api/blog/${blogId}`);
      setBlog(response.data);
    } catch (err) {
      console.error("Failed to fetch blog:", err);
      showError("Failed to load blog");
    } finally {
      setLoading(false);
    }
  }, [blogId, showError]);

  useEffect(() => {
    fetchBlog();
  }, [fetchBlog]);

  const handleBack = () => {
    if (blog?.project_id) {
      window.location.href = `/dashboard/blogs?projectId=${blog.project_id}`;
    } else {
      window.location.href = "/dashboard/blogs";
    }
  };

  const handleEdit = () => {
    window.location.href = `/dashboard/blogs/edit/${blogId}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getReadingTime = (content: string | null) => {
    if (!content) return 0;
    const words = content.split(/\s+/).length;
    return Math.ceil(words / 200);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center h-96">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900">Blog not found</h2>
            <Button variant="ghost" onClick={handleBack} className="mt-4">
              Back to Blogs
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const readingTime = getReadingTime(blog.content);

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Button variant="ghost" onClick={handleBack}>
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Blogs
          </Button>
        </div>

        <article className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {blog.image_url && (
            <div className="relative h-64 md:h-96 w-full">
              <img
                src={blog.image_url}
                alt={blog.title || "Blog image"}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
            </div>
          )}

          <div className="p-6 md:p-10">
            <div className="flex items-center gap-3 mb-6">
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  blog.status === "published"
                    ? "bg-green-100 text-green-800"
                    : "bg-yellow-100 text-yellow-800"
                }`}
              >
                {blog.status === "published" ? "Published" : "Draft"}
              </span>
              <span className="text-gray-400">•</span>
              <span className="text-gray-600 text-sm">{formatDate(blog.createdAt)}</span>
              {readingTime > 0 && (
                <>
                  <span className="text-gray-400">•</span>
                  <span className="text-gray-600 text-sm">{readingTime} min read</span>
                </>
              )}
            </div>

            <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4 leading-tight">
              {blog.title || "Untitled Blog"}
            </h1>

            {blog.description && (
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                {blog.description}
              </p>
            )}

            {blog.meta_description && (
              <div className="mb-8 p-4 bg-gray-50 rounded-lg border-l-4 border-red-500">
                <p className="text-sm text-gray-700">
                  <span className="font-semibold">Meta Description:</span> {blog.meta_description}
                </p>
              </div>
            )}

            <div className="border-t border-gray-200 my-8"></div>

            {blog.content ? (
              <div className="prose prose-lg max-w-none">
                <div
                  className="blog-content text-gray-800 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: blog.content }}
                />
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p>No content available</p>
              </div>
            )}

            <div className="border-t border-gray-200 mt-12 pt-8">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-500">
                  Last updated: {formatDate(blog.updatedAt)}
                </div>
                <Button variant="gradient" onClick={handleEdit}>
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Edit Blog
                </Button>
              </div>
            </div>
          </div>
        </article>
      </div>
    </div>
  );
}
