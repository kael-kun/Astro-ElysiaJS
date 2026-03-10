import React, { useState, useEffect, useCallback } from "react";
import { Button } from "src/components/ui/Button";
import apiClient from "src/services/apiClient";
import { useToastContext } from "src/providers/ToastProvider";
import ReactMarkdown from "react-markdown";

interface BlogData {
  id: string;
  title: string | null;
  description: string | null;
  content: string | null;
  meta_description: string | null;
  status: "draft" | "published";
  image_url: string | null;
  project_id: string | null;
  view_count?: number;
  createdAt: string;
  updatedAt: string;
}

interface BlogViewContentProps {
  blogId: string;
}

export function BlogViewContent({ blogId }: BlogViewContentProps) {
  const [blog, setBlog] = useState<BlogData | null>(null);
  const [loading, setLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  const { error: showError } = useToastContext();

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
    const params = new URLSearchParams(window.location.search);
    const projectId = params.get("projectId");

    if (projectId) {
      window.location.href = `/dashboard/blogs?projectId=${projectId}&action=list`;
    } else {
      window.location.href = "/dashboard/blogs";
    }
  };

  const handleEdit = () => {
    const params = new URLSearchParams(window.location.search);
    const projectId = params.get("projectId");
    window.location.href = `/dashboard/blogs/edit/${blogId}?projectId=${projectId}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
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
          <div className="relative h-64 md:h-96 w-full">
            {blog.image_url && !imageError ? (
              <>
                <img
                  src={blog.image_url}
                  alt={blog.title || "Blog image"}
                  className="w-full h-full object-cover"
                  onError={() => setImageError(true)}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
              </>
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                <svg className="w-24 h-24 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            )}
          </div>

          <div className="p-6 md:p-10">
            <div className="flex items-center gap-3 mb-6">
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  blog.status === "published" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                }`}
              >
                {blog.status === "published" ? "Published" : "Draft"}
              </span>
              <span className="text-gray-400">•</span>
              <span className="text-gray-600 text-sm">{formatDate(blog.createdAt)}</span>
              {blog.view_count !== undefined && (
                <>
                  <span className="text-gray-400">•</span>
                  <span className="text-gray-600 text-sm flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    {blog.view_count} views
                  </span>
                </>
              )}
            </div>

            <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4 leading-tight">
              {blog.title || "Untitled Blog"}
            </h1>

            {blog.description ? (
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">{blog.description}</p>
            ) : (
              <p className="text-xl text-gray-400 mb-8 leading-relaxed italic">No description available</p>
            )}

            <div className="border-t border-gray-200 my-8"></div>

            {blog.content ? (
              <div className="blog-content text-gray-800">
                <ReactMarkdown
                  components={{
                    h1: ({ children }) => <h1 className="text-4xl font-bold text-gray-900 mt-8 mb-4">{children}</h1>,
                    h2: ({ children }) => <h2 className="text-3xl font-bold text-gray-900 mt-8 mb-4">{children}</h2>,
                    h3: ({ children }) => <h3 className="text-2xl font-semibold text-gray-900 mt-6 mb-3">{children}</h3>,
                    h4: ({ children }) => <h4 className="text-xl font-semibold text-gray-900 mt-4 mb-2">{children}</h4>,
                    p: ({ children }) => <p className="text-lg text-gray-700 mb-4 leading-relaxed">{children}</p>,
                    ul: ({ children }) => <ul className="list-disc list-inside mb-4 space-y-2 ml-4">{children}</ul>,
                    ol: ({ children }) => <ol className="list-decimal list-inside mb-4 space-y-2 ml-4">{children}</ol>,
                    li: ({ children, ...props }) => (
                      <li className="text-gray-700 mb-1" {...props}>
                        {children}
                      </li>
                    ),
                    blockquote: ({ children }) => (
                      <blockquote className="border-l-4 border-gray-300 pl-4 py-2 my-4 italic text-gray-600 bg-gray-50">
                        {children}
                      </blockquote>
                    ),
                    code: ({ className, children }) => {
                      const match = /language-(\w+)/.exec(className || "");
                      const isInline = !match;
                      return isInline ? (
                        <code className="bg-gray-100 text-red-600 px-1 py-0.5 rounded text-sm font-mono">{children}</code>
                      ) : (
                        <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto my-4">
                          <code className={className}>{children}</code>
                        </pre>
                      );
                    },
                    a: ({ href, children }) => (
                      <a href={href} className="text-blue-600 hover:text-blue-800 underline" target="_blank" rel="noopener noreferrer">
                        {children}
                      </a>
                    ),
                    img: ({ src, alt }) => (
                      <img src={src} alt={alt || ""} className="w-full h-auto rounded-lg my-4 shadow-md" />
                    ),
                    hr: () => <hr className="my-8 border-gray-300" />,
                    table: ({ children }) => (
                      <div className="overflow-x-auto my-4">
                        <table className="min-w-full border border-gray-200">{children}</table>
                      </div>
                    ),
                    thead: ({ children }) => <thead className="bg-gray-50">{children}</thead>,
                    th: ({ children }) => <th className="border border-gray-200 px-4 py-2 text-left font-semibold text-gray-900">{children}</th>,
                    td: ({ children }) => <td className="border border-gray-200 px-4 py-2">{children}</td>,
                    strong: ({ children }) => <strong className="font-bold text-gray-900">{children}</strong>,
                    em: ({ children }) => <em className="italic">{children}</em>,
                  }}
                >
                  {blog.content}
                </ReactMarkdown>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <svg
                  className="w-16 h-16 mx-auto mb-4 text-gray-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <p>No content available</p>
              </div>
            )}

            <div className="border-t border-gray-200 mt-12 pt-8">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-500">Last updated: {formatDate(blog.updatedAt)}</div>
                <Button variant="gradient" onClick={handleEdit}>
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
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
