import React, { useState, useEffect, useCallback } from "react";
import { BlogForm, BlogFormValues } from "./BlogForm";
import { ImageUpload } from "./ImageUpload";
import { BlogEditor } from "./BlogEditor";
import { BlogPreview } from "./BlogPreview";
import { useImageUpload } from "./hooks/useImageUpload";
import { useBlogGenerator } from "./hooks/useBlogGenerator";
import { useDraftManager } from "./hooks/useDraftManager";
import { useProjectBlogs } from "./hooks/useProjectBlogs";
import { Card } from "../ui/Card";
import { Button } from "../ui/Button";
import apiClient from "../../services/apiClient";
import { useToast } from "../../hooks/useToast";

interface Project {
  id: string;
  name: string;
  description: string | null;
}

export function GenerateBlogContent() {
  const [projectId, setProjectId] = useState<string | null>(null);
  const [project, setProject] = useState<Project | null>(null);
  const [loadingProject, setLoadingProject] = useState(false);
  const [form, setForm] = useState<BlogFormValues>({
    topic: "",
    keywords: "",
    tone: "professional",
    audience: "",
  });
  const [validationError, setValidationError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const { success, error: showError } = useToast();
  const { previewImage, fileName, uploadedFile, uploadError, handleFileUpload, removeImage } = useImageUpload();
  const { content, loading: generating, error: generationError, generateBlog } = useBlogGenerator(projectId || undefined);
  const { saveDraft } = useDraftManager();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlProjectId = params.get("projectId");

    if (urlProjectId) {
      setProjectId(urlProjectId);
      fetchProject(urlProjectId);
    }
  }, []);

  const fetchProject = async (id: string) => {
    setLoadingProject(true);
    try {
      const response = await apiClient.get<Project>(`/api/project/${id}`);
      setProject(response.data);
    } catch (err) {
      console.error("Failed to fetch project:", err);
    } finally {
      setLoadingProject(false);
    }
  };

  const displayError = generationError || uploadError;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!form.topic.trim()) {
      setValidationError("Topic is required");
      return;
    }
    if (!form.keywords.trim()) {
      setValidationError("Keywords are required");
      return;
    }
    if (!form.audience.trim()) {
      setValidationError("Target audience is required");
      return;
    }
    if (!form.tone.trim()) {
      setValidationError("Tone is required");
      return;
    }

    setValidationError(null);
    generateBlog(form);
  };

  const handleSaveBlog = async () => {
    if (!content || !projectId) return;

    setSaving(true);
    try {
      await apiClient.post("/api/blog", {
        user_id: "current",
        content,
        meta_description: form.topic,
        status: "draft",
        project_id: projectId,
      });

      success("Blog has been saved successfully.");
      
      setTimeout(() => {
        window.location.href = `/dashboard/blogs?projectId=${projectId}`;
      }, 1000);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to save blog";
      showError(message);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveDraft = () => {
    saveDraft({ form, content, fileName, uploadedFile });
  };

  const handlePublish = () => {
    console.log("Blog published!");
  };

  const handleBack = () => {
    if (projectId) {
      window.location.href = `/dashboard/blogs?projectId=${projectId}`;
    } else {
      window.location.href = "/dashboard/projects";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          {/* Back Button */}
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
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-red-600 to-red-700 mb-2 pb-2">
            AI Blog Generator
          </h1>
          {project && (
            <div className="inline-flex items-center px-4 py-2 bg-red-100 text-red-800 rounded-full text-sm font-medium">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
                />
              </svg>
              {loadingProject ? "Loading..." : project.name}
            </div>
          )}
          <p className="text-gray-600 text-lg max-w-2xl mx-auto mt-4">
            Create engaging, SEO-optimized blog content in seconds with AI power
          </p>
        </div>

        <div className="flex flex-col gap-8">
          <BlogForm
            form={form}
            loading={generating}
            error={displayError}
            validationError={validationError}
            onChange={handleChange}
            onSubmit={handleSubmit}
          />

          {content && (
            <Card shadow="lg" rounded="xl">
              <ImageUpload
                previewImage={previewImage}
                fileName={fileName}
                onFileUpload={handleFileUpload}
                onRemoveImage={removeImage}
              />
              <BlogEditor content={content} onContentChange={() => {}} />
              <BlogPreview
                content={content}
                uploadedFile={uploadedFile}
                onSaveDraft={handleSaveDraft}
                onPublish={handlePublish}
                showContent={true}
                onSave={handleSaveBlog}
                saving={saving}
              />
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
