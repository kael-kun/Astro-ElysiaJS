import React, { useState, useEffect, useRef } from "react";
import { BlogForm, BlogFormValues } from "src/components/blog/components/BlogForm";
import { ImageUpload } from "src/components/blog/components/ImageUpload";
import { TiptapEditor } from "src/components/blog/components/TiptapEditor";
import { BlogPreview } from "src/components/blog/components/BlogPreview";
import { useImageUpload } from "src/components/blog/hooks/useImageUpload";
import { useBlogGenerator } from "src/components/blog/hooks/UseBlogGenerator";
import { Card } from "src";
import { Button } from "src";
import { Input } from "src";
import apiClient from "src/services/apiClient";
import { useToastContext } from "src/providers/ToastProvider";

interface Project {
  id: string;
  name: string;
  description: string | null;
}

const statusOptions = [
  { value: "draft", label: "Save as Draft" },
  { value: "published", label: "Publish" },
];

type BlogMode = "manual" | "generate";

function getModeFromURL(): BlogMode {
  if (typeof window === "undefined") return "manual";
  const params = new URLSearchParams(window.location.search);
  const mode = params.get("mode");
  return mode === "generate" ? "generate" : "manual";
}

export function GenerateBlogContent() {
  const [mode, setMode] = useState<BlogMode>("manual");
  const [projectId, setProjectId] = useState<string | null>(null);
  const [project, setProject] = useState<Project | null>(null);
  const [loadingProject, setLoadingProject] = useState(false);
  const [form, setForm] = useState<BlogFormValues>({
    topic: "",
    keywords: "",
    tone: "professional",
    audience: "",
  });
  const [status, setStatus] = useState<"draft" | "published">("draft");
  const [validationError, setValidationError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Editable metadata state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [manualContent, setManualContent] = useState("");
  const [generatedContent, setGeneratedContent] = useState("");

  const { error: showError, success: showSuccess } = useToastContext();
  const { previewImage, fileName, uploadedFile, uploadError, handleFileUpload, removeImage } = useImageUpload();
  const {
    content,
    metadata,
    loading: generating,
    error: generationError,
    generateBlog,
  } = useBlogGenerator(projectId || undefined);

  const generatedContentRef = useRef<HTMLDivElement>(null);
  const prevContentRef = useRef("");

  // Scroll to generated content when content first appears (for streaming)
  useEffect(() => {
    if (prevContentRef.current === "" && content !== "") {
      setTimeout(() => {
        generatedContentRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    }
    prevContentRef.current = content;
  }, [content]);

  // Update editable fields when metadata is generated
  useEffect(() => {
    if (metadata.title) {
      setTitle(metadata.title);
    }
    if (metadata.description) {
      setDescription(metadata.description);
    }
    if (metadata.meta_description) {
      setMetaDescription(metadata.meta_description);
    }
  }, [metadata]);

  // Sync generated content to editable state
  useEffect(() => {
    if (content) {
      setGeneratedContent(content);
    }
  }, [content]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlProjectId = params.get("projectId");
    const urlMode = getModeFromURL();

    setMode(urlMode);

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
    if (!generatedContent || !projectId) return;

    if (title.length > 200) {
      showError("Title must be 200 characters or less");
      return;
    }
    if (description.length > 500) {
      showError("Description must be 500 characters or less");
      return;
    }
    if (metaDescription.length > 160) {
      showError("Meta description must be 160 characters or less");
      return;
    }
    if (generatedContent.length > 50000) {
      showError("Content must be 50,000 characters or less");
      return;
    }

    setSaving(true);
    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      formData.append("content", generatedContent);
      formData.append("meta_description", metaDescription);
      formData.append("status", status);
      formData.append("project_id", projectId);

      if (uploadedFile) {
        formData.append("image", uploadedFile);
      }

      await apiClient.post("/api/blog", formData as any);

      showSuccess("Blog has been saved successfully.");

      setTimeout(() => {
        window.location.href = `/dashboard/blogs?projectId=${projectId}&action=list`;
      }, 1000);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to save blog";
      showError(message);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveManualBlog = async () => {
    if (!projectId) return;

    if (!title.trim()) {
      showError("Title is required");
      return;
    }

    if (title.length > 200) {
      showError("Title must be 200 characters or less");
      return;
    }

    if (description.length > 500) {
      showError("Description must be 500 characters or less");
      return;
    }

    if (metaDescription.length > 160) {
      showError("Meta description must be 160 characters or less");
      return;
    }

    if (!manualContent.trim()) {
      showError("Content is required");
      return;
    }

    if (manualContent.length > 50000) {
      showError("Content must be 50,000 characters or less");
      return;
    }

    setSaving(true);
    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      formData.append("content", manualContent);
      formData.append("meta_description", metaDescription);
      formData.append("status", status);
      formData.append("project_id", projectId);

      if (uploadedFile) {
        formData.append("image", uploadedFile);
      }

      await apiClient.post("/api/blog", formData as any);

      showSuccess("Blog has been saved successfully.");

      setTimeout(() => {
        window.location.href = `/dashboard/blogs?projectId=${projectId}&action=list`;
      }, 1000);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to save blog";
      showError(message);
    } finally {
      setSaving(false);
    }
  };

  const handleBack = () => {
    if (projectId) {
      window.location.href = `/dashboard/blogs?projectId=${projectId}&action=list`;
    } else {
      window.location.href = "/dashboard/projects";
    }
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatus(e.target.value as "draft" | "published");
  };

  const handleModeChange = (newMode: BlogMode) => {
    if (!projectId) return;
    const projectName = project?.name || "";
    window.location.href = `/dashboard/blogs/generate?projectId=${projectId}&projectName=${encodeURIComponent(projectName)}&mode=${newMode}`;
  };

  const renderModeToggle = () => (
    <div className="flex justify-center mb-6">
      <div className="inline-flex bg-gray-200 rounded-lg p-1">
        <button
          type="button"
          onClick={() => handleModeChange("manual")}
          className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${
            mode === "manual"
              ? "bg-white text-red-600 shadow-sm"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          <svg className="w-4 h-4 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          Create Manually
        </button>
        <button
          type="button"
          onClick={() => handleModeChange("generate")}
          className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${
            mode === "generate"
              ? "bg-white text-red-600 shadow-sm"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          <svg className="w-4 h-4 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          Generate with AI
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          {/* Back Button */}
          <div className="flex justify-start mb-4">
            <Button variant="ghost" onClick={handleBack}>
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Blogs
            </Button>
          </div>

          {renderModeToggle()}

          <div className="inline-flex items-center justify-center size-16 rounded-2xl bg-gradient-to-br from-red-600 to-red-700 mb-4">
            {mode === "manual" ? (
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            ) : (
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            )}
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-red-600 to-red-700 mb-2 pb-2">
            {mode === "manual" ? "Create Blog Manually" : "AI Blog Generator"}
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
            {mode === "manual" 
              ? "Create your blog post by writing content manually" 
              : "Create engaging, SEO-optimized blog content in seconds with AI power"}
          </p>
        </div>

        <div className="flex flex-col gap-8">
          {mode === "manual" ? (
            <Card shadow="lg" rounded="xl">
              <ImageUpload
                previewImage={previewImage}
                fileName={fileName}
                onFileUpload={handleFileUpload}
                onRemoveImage={removeImage}
              />

              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Metadata</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                    <Input
                      id="title"
                      name="title"
                      type="text"
                      value={title}
                      onChange={handleMetadataChange}
                      placeholder="Enter blog title"
                      required
                      maxLength={200}
                    />
                    <p className="mt-1 text-sm text-gray-500">{title.length}/200 characters</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <Input
                      id="description"
                      name="description"
                      type="text"
                      value={description}
                      onChange={handleMetadataChange}
                      placeholder="Enter short description"
                      maxLength={500}
                    />
                    <p className="mt-1 text-sm text-gray-500">{description.length}/500 characters</p>
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
                    placeholder="Enter meta description for SEO"
                    maxLength={160}
                  />
                  <p className="mt-1 text-sm text-gray-500">{metaDescription.length}/160 characters</p>
                </div>
              </div>

              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Content *</h3>
                <TiptapEditor 
                  content={manualContent} 
                  onContentChange={setManualContent} 
                  height="500px" 
                />
                <p className="mt-2 text-sm text-gray-500">{manualContent.length}/50,000 characters</p>
              </div>

              <BlogPreview
                content={manualContent}
                showContent={true}
                onSave={handleSaveManualBlog}
                saving={saving}
                status={status}
                onStatusChange={handleStatusChange}
                statusOptions={statusOptions}
              />
            </Card>
          ) : (
            <>
              <BlogForm
                form={form}
                loading={generating}
                error={displayError}
                validationError={validationError}
                onChange={handleChange}
                onSubmit={handleSubmit}
              />

              {/* Always render this wrapper for scroll target */}
              <div ref={generatedContentRef}>
                {content ? (
                  <Card shadow="lg" rounded="xl">
                    <ImageUpload
                      previewImage={previewImage}
                      fileName={fileName}
                      onFileUpload={handleFileUpload}
                      onRemoveImage={removeImage}
                    />

                    {/* Generated Metadata Display - Editable */}
                    <div className="p-6 border-b border-gray-200">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Generated Metadata</h3>
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
                            maxLength={200}
                          />
                          <p className="mt-1 text-sm text-gray-500">{title.length}/200 characters</p>
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
                            maxLength={500}
                          />
                          <p className="mt-1 text-sm text-gray-500">{description.length}/500 characters</p>
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
                          maxLength={160}
                        />
                        <p className="mt-1 text-sm text-gray-500">{metaDescription.length}/160 characters</p>
                      </div>
                    </div>

                    <TiptapEditor content={generatedContent} onContentChange={setGeneratedContent} height="500px" />
                    <p className="mt-2 mx-6 text-sm text-gray-500">{generatedContent.length}/50,000 characters</p>

                    {/* Show loading indicator while generating */}
                    {generating && (
                      <div className="p-4 border-t border-gray-200 bg-gray-50">
                        <div className="flex items-center justify-center gap-2 text-gray-600">
                          <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          <span>Generating content...</span>
                        </div>
                      </div>
                    )}

                    <BlogPreview
                      content={generatedContent}
                      showContent={true}
                      onSave={handleSaveBlog}
                      saving={saving}
                      disabled={generating}
                      status={status}
                      onStatusChange={handleStatusChange}
                      statusOptions={statusOptions}
                    />
                  </Card>
                ) : null}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
