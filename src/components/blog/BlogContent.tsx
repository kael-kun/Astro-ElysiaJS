import React, { useState } from "react";
import { BlogForm, BlogFormValues } from "./BlogForm";
import { ImageUpload } from "./ImageUpload";
import { BlogEditor } from "./BlogEditor";
import { BlogPreview } from "./BlogPreview";
import { useImageUpload } from "./hooks/useImageUpload";
import { useBlogGenerator } from "./hooks/useBlogGenerator";
import { useDraftManager } from "./hooks/useDraftManager";
import { Card } from "../ui/Card";

export function BlogContent() {
  const [form, setForm] = useState<BlogFormValues>({
    topic: "",
    keywords: "",
    tone: "professional",
    audience: "",
  });
  const [validationError, setValidationError] = useState<string | null>(null);

  const { previewImage, fileName, uploadedFile, uploadError, handleFileUpload, removeImage } = useImageUpload();
  const { content, loading, error, generateBlog } = useBlogGenerator();
  const { saveDraft } = useDraftManager();

  // Merge upload error with generation error
  const displayError = error || uploadError;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all required fields
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

  const handleSaveDraft = () => {
    saveDraft({ form, content, fileName, uploadedFile });
  };

  const handlePublish = () => {
    console.log("Blog published!");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
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
          <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-red-600 to-red-700 mb-6 pb-2">
            AI Blog Generator
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Create engaging, SEO-optimized blog content in seconds with AI power
          </p>
        </div>

        <div className="flex flex-col gap-8">
          <BlogForm
            form={form}
            loading={loading}
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
              />
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
