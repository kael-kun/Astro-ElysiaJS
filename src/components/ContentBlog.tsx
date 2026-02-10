import { useState, useEffect } from "react";
import MDEditor from "@uiw/react-md-editor";

type FormValues = {
  topic: string;
  keywords: string;
  tone: string;
  audience: string;
  wordCount: number;
};

export function ContentBlog() {
  const [form, setForm] = useState<FormValues>({
    topic: "",
    keywords: "",
    tone: "professional",
    audience: "",
    wordCount: 800,
  });

  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [draftContent, setDraftContent] = useState("");
  const [activeTab, setActiveTab] = useState<"write" | "preview">("write");

  useEffect(() => {
    if (isEditing && content) {
      setDraftContent(content);
      setActiveTab("write");
    }
  }, [isEditing, content]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === "wordCount" ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1200));
      const mockContent = generateMockBlog(form);
      setContent(mockContent);
      setIsEditing(false);
    } catch (err) {
      setError("Error generating blog content. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveEdit = () => {
    setContent(draftContent);
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setDraftContent(content);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Escape" && isEditing) {
      handleCancelEdit();
    }
  };

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8"
      onKeyDown={handleKeyDown}
    >
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-red-600 to-red-700 mb-4">
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
          {/* Form Section */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 md:p-8">
            <form onSubmit={handleSubmit}>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Topic <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="topic"
                    value={form.topic}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all outline-none placeholder:text-gray-400"
                    placeholder="e.g., The Future of AI in Content Creation"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Keywords</label>
                  <input
                    type="text"
                    name="keywords"
                    value={form.keywords}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all outline-none placeholder:text-gray-400"
                    placeholder="e.g., AI, content marketing, automation"
                  />
                  <p className="mt-1 text-xs text-gray-500">Separate keywords with commas</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Target Audience</label>
                  <input
                    type="text"
                    name="audience"
                    value={form.audience}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all outline-none placeholder:text-gray-400"
                    placeholder="e.g., Marketing professionals, business owners"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Tone</label>
                  <select
                    name="tone"
                    value={form.tone}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all outline-none bg-white cursor-pointer"
                  >
                    <option value="professional">Professional</option>
                    <option value="casual">Casual</option>
                    <option value="technical">Technical</option>
                    <option value="friendly">Friendly</option>
                    <option value="marketing">Marketing</option>
                    <option value="academic">Academic</option>
                    <option value="conversational">Conversational</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Word Count</label>
                  <div className="flex items-center gap-4">
                    <input
                      type="range"
                      name="wordCount"
                      min="200"
                      max="2000"
                      step="100"
                      value={form.wordCount}
                      onChange={handleChange}
                      className="flex-1 h-2 bg-red-100 rounded-lg appearance-none cursor-pointer accent-red-600"
                    />
                    <span className="text-sm font-medium text-gray-700 min-w-[60px] text-right">
                      {form.wordCount} words
                    </span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>200</span>
                    <span>2000</span>
                  </div>
                </div>

                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">{error}</div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full py-4 px-6 rounded-xl font-semibold text-lg transition-all transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                    loading
                      ? "bg-gray-300 cursor-not-allowed"
                      : "bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-lg shadow-red-500/20"
                  }`}
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg
                        className="animate-spin h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Generating... ({Math.floor(Math.random() * 30 + 10)}%)
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                        />
                      </svg>
                      Generate Blog Content
                    </span>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Preview Section - SINGLE CONTAINER LAYOUT */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100">
            {/* Header with Edit Button */}
            <div className="px-6 md:px-8 pt-6 md:pt-8 pb-4 border-b border-gray-100">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-2 flex items-center gap-2">
                    <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    {isEditing ? "Editing Content" : "Generated Content"}
                  </h2>
                  <p className="text-gray-600 text-sm">
                    {content
                      ? isEditing
                        ? "Switch tabs to edit or preview. Save changes when ready."
                        : "Click 'Edit Content' to modify your blog post"
                      : "Your generated blog content will appear here..."}
                  </p>
                </div>
                {!isEditing && content && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2 shadow-md whitespace-nowrap"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                    Edit Content
                  </button>
                )}
              </div>
            </div>

            {/* Content Area */}
            <div className="px-6 md:px-8 py-6">
              {content ? (
                isEditing ? (
                  // EDIT MODE - SINGLE CONTAINER
                  <div className="space-y-6">
                    {/* Tab Navigation */}
                    <div className="border-b border-gray-200">
                      <nav className="flex space-x-6" aria-label="Tabs">
                        <button
                          onClick={() => setActiveTab("write")}
                          className={`${
                            activeTab === "write"
                              ? "text-red-600 font-semibold border-b-2 border-red-600"
                              : "text-gray-500 hover:text-gray-700"
                          } pb-3 px-1 font-medium text-sm md:text-base flex items-center gap-2 transition-colors`}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                            />
                          </svg>
                          Write
                        </button>
                        <button
                          onClick={() => setActiveTab("preview")}
                          className={`${
                            activeTab === "preview"
                              ? "text-red-600 font-semibold border-b-2 border-red-600"
                              : "text-gray-500 hover:text-gray-700"
                          } pb-3 px-1 font-medium text-sm md:text-base flex items-center gap-2 transition-colors`}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                            />
                          </svg>
                          Preview
                        </button>
                      </nav>
                    </div>

                    {/* Content Display - Occupies Remaining Space */}
                    <div className="min-h-[400px]">
                      {activeTab === "write" ? (
                        <div className="border rounded-lg overflow-hidden bg-white">
                          <MDEditor
                            value={draftContent}
                            onChange={(value) => setDraftContent(value || "")}
                            preview="edit"
                            height="100%"
                            visibleDragbar={false}
                            textareaProps={{
                              placeholder: "Write your content here...",
                              className: "focus:outline-none",
                            }}
                            className="w-full h-full border-0"
                          />
                        </div>
                      ) : (
                        <div className="prose prose-red max-w-none bg-gray-50 rounded-lg border border-gray-200 p-6">
                          <MDEditor.Markdown
                            source={draftContent}
                            style={{ backgroundColor: "transparent", padding: 0 }}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  // PREVIEW MODE
                  <div className="prose prose-red max-w-none min-h-[400px]">
                    <MDEditor.Markdown source={content} style={{ backgroundColor: "transparent", padding: 0 }} />
                  </div>
                )
              ) : (
                // Placeholder
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center bg-gray-50">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4">
                    <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">No Content Yet</h3>
                  <p className="text-gray-600 mb-6">
                    Fill out the form on the left and click "Generate Blog Content" to get started
                  </p>
                  <div className="flex flex-wrap justify-center gap-2">
                    {["🚀 Fast Generation", "🎯 SEO Optimized", "📝 Professional Quality"].map((feature, i) => (
                      <span key={i} className="px-3 py-1 bg-red-50 text-red-700 rounded-full text-sm font-medium">
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons - FIXED AT BOTTOM */}
            {content && (
              <div className="border-t border-gray-100 bg-gray-50 px-6 md:px-8 py-4">
                {isEditing ? (
                  // Edit Mode Actions
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end gap-3">
                    <div className="flex-1 text-xs text-gray-500"></div>
                    <div className="flex gap-3">
                      <button
                        onClick={handleCancelEdit}
                        className="px-5 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center gap-2 whitespace-nowrap"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        Cancel
                      </button>
                      <button
                        onClick={handleSaveEdit}
                        className="px-5 py-2.5 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-lg font-medium transition-all shadow-md flex items-center gap-2 whitespace-nowrap"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Save Changes
                      </button>
                    </div>
                  </div>
                ) : (
                  // Preview Mode Actions
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button className="flex-1 h-12 px-4 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2.5 shadow-md">
                      <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12h6m-6 4h6m2 4H7a2 2 0 01-2-2V6a2 2 0 012-2h5l5 5v11a2 2 0 01-2 2z"
                        />
                      </svg>
                      <span className="text-base font-medium">Save Draft</span>
                    </button>
                    <button className="flex-1 h-12 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2.5 shadow-md">
                      <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                        />
                      </svg>
                      <span className="text-base font-medium">Publish</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const generateMockBlog = (form: FormValues) => {
  return `# ${form.topic}

*Target Audience: ${form.audience || "General Readers"}*  
*Tone: ${form.tone}*  
*Keywords: ${form.keywords || "None provided"}*

## Introduction

This is a sample generated blog post about **${form.topic}**. It demonstrates how content might look when generated using AI technology.

## Main Discussion

In today's world, the topic of *${form.topic}* has become increasingly important. Many professionals, especially ${form.audience || "various audiences"}, are paying close attention to developments in this field.

### Key Points

- First key point about ${form.topic} and its practical applications
- Another important aspect of ${form.topic} that impacts industry standards
- How ${form.topic} creates opportunities for innovation and growth
- Real-world examples demonstrating the value of ${form.topic}

> "The future of content creation lies at the intersection of human creativity and artificial intelligence."

## Conclusion

This mock blog demonstrates the structure and formatting of content containing approximately **${form.wordCount} words**. In a production system, the AI would generate comprehensive, well-researched content tailored to your specific requirements. The possibilities for creating high-quality content at scale are truly exciting!

*Generated with AI Blog Generator • ${new Date().toLocaleDateString()}*`;
};
