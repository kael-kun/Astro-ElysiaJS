import React, { useState, useEffect, useCallback } from "react";
import { TiptapEditor } from "./TiptapEditor";
import { BlogPreview } from "./BlogPreview";
import { ImageUpload } from "./ImageUpload";
import { useImageUpload } from "../hooks/useImageUpload";
import { Card } from "../../ui/Card";
import { Button } from "../../ui/Button";
import { Input } from "../../ui/Input";
import apiClient from "src/services/apiClient";
import { useToastContext } from "src/providers/ToastProvider";

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

interface BlogEditContentProps {
  blogId: string;
}

const statusOptions = [
  { value: "draft", label: "Save as Draft" },
  { value: "published", label: "Publish" },
];

export function BlogEditContent({ blogId }: BlogEditContentProps) {
  const [blog, setBlog] = useState<BlogData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [content, setContent] = useState("");
  const [status, setStatus] = useState<"draft" | "published">("draft");

  const { error: showError, success: showSuccess } = useToastContext();
  const { previewImage, fileName, uploadedFile, uploadError, handleFileUpload, removeImage, setPreviewImage } =
    useImageUpload();
  const params = new URLSearchParams(window.location.search);
  const projectId = params.get("projectId");
  const fetchBlog = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiClient.get<BlogData>(`/api/blog/${blogId}`);
      const blogData = response.data;
      setBlog(blogData);

      setTitle(blogData.title || "");
      setDescription(blogData.description || "");
      setMetaDescription(blogData.meta_description || "");
      setContent(blogData.content || "");
      setStatus(blogData.status || "draft");

      if (blogData.image_url) {
        setPreviewImage(blogData.image_url);
      }
    } catch (err) {
      console.error("Failed to fetch blog:", err);
      showError("Failed to load blog");
    } finally {
      setLoading(false);
    }
  }, [blogId, showError, setPreviewImage]);

  useEffect(() => {
    fetchBlog();
  }, [fetchBlog]);

  const handleMetadataChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === "title") {
      setTitle(value);
    } else if (name === "description") {
      setDescription(value);
    } else if (name === "meta_description") {
      setMetaDescription(value);
    }
  };

  const handleContentChange = (newContent: string) => {
    setContent(newContent);
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatus(e.target.value as "draft" | "published");
  };

  const handleImageError = () => {
    setPreviewImage(null);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      formData.append("meta_description", metaDescription);
      formData.append("content", content);
      formData.append("status", status);

      if (uploadedFile) {
        formData.append("image", uploadedFile);
      }

      await apiClient.put(`/api/blog/${blogId}`, formData as any);

      showSuccess("Blog has been updated successfully.");

      setTimeout(() => {
        if (projectId) {
          window.location.href = `/dashboard/blogs?projectId=${projectId}&action=list`;
        } else {
          window.location.href = "/dashboard/blogs";
        }
      }, 1000);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to update blog";
      showError(message);
    } finally {
      setSaving(false);
    }
  };

  const handleBack = () => {
    if (projectId) {
      window.location.href = `/dashboard/blogs?projectId=${projectId}&action=list`;
    } else {
      window.location.href = "/dashboard/blogs";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-10">
          <div className="flex justify-start mb-4">
            <Button variant="ghost" onClick={handleBack}>
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Blogs
            </Button>
          </div>

          <div className="inline-flex items-center justify-center size-16 rounded-2xl bg-gradient-to-br from-red-600 to-red-700 mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-red-600 to-red-700 mb-2 pb-2">
            Edit Blog
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl4">Update mx-auto mt- your blog content and metadata</p>
        </div>

        <Card shadow="lg" rounded="xl">
          <ImageUpload
            previewImage={previewImage}
            fileName={fileName}
            onFileUpload={handleFileUpload}
            onRemoveImage={removeImage}
            onImageError={handleImageError}
          />

          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Metadata</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <Input
                  id="title"
                  name="title"
                  type="text"
                  value={title}
                  onChange={handleMetadataChange}
                  placeholder="Enter title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <Input
                  id="description"
                  name="description"
                  type="text"
                  value={description}
                  onChange={handleMetadataChange}
                  placeholder="Enter description"
                />
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Meta Description (SEO)</label>
              <Input
                id="meta_description"
                name="meta_description"
                type="text"
                value={metaDescription}
                onChange={handleMetadataChange}
                placeholder="Enter meta description"
              />
            </div>
          </div>

          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Content</h3>
            <TiptapEditor content={content} onContentChange={handleContentChange} height="500px" />
          </div>

          <BlogPreview
            content={content}
            showContent={true}
            onSave={handleSave}
            saving={saving}
            status={status}
            onStatusChange={handleStatusChange}
            statusOptions={statusOptions}
          />
        </Card>
      </div>
    </div>
  );
}
