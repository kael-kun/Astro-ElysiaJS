import { useState, useEffect } from "react";
import "@toast-ui/editor/dist/toastui-editor.css";
import { Editor } from "@toast-ui/react-editor";

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
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === "wordCount" ? Number(value) : value,
    }));
  };
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Only image files are allowed.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("File size must be under 5MB.");
      return;
    }

    setError(null);
    setFileName(file.name);
    setUploadedFile(file);

    const reader = new FileReader();

    reader.onload = () => {
      const result = reader.result as string;
      setPreviewImage(result);
    };

    reader.readAsDataURL(file);

    e.target.value = "";
  };

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1200));
      const mockContent = generateMockBlog(form);

      console.log(form);
      setContent(mockContent);
    } catch (err) {
      setError("Error generating blog content. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getBlogData = () => {
    return {
      content,
      file: uploadedFile,
    };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8">
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

          {/* Content Section */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100">
            {content && (
              <div className="flex flex-col space-y-4">
                <div className="p-6 border-b border-gray-100">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Upload Image (Tumbnails)</label>

                  {!previewImage && (
                    <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:bg-gray-50 transition-all">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <svg
                          className="w-10 h-10 text-gray-400 mb-3"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                          />
                        </svg>

                        <p className="mb-2 text-sm text-gray-500">
                          <span className="font-semibold">Click to upload</span>
                        </p>
                        <p className="text-xs text-gray-400">PNG, JPG up to 5MB</p>
                      </div>

                      <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
                    </label>
                  )}

                  {previewImage && (
                    <div className="flex flex-col gap-3">
                      <div className="relative w-full max-w-sm">
                        <img src={previewImage} alt="Preview" className="rounded-lg border border-gray-200 shadow-sm" />
                        <button
                          type="button"
                          onClick={() => {
                            setPreviewImage(null);
                            setFileName(null);
                          }}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-600 transition cursor-pointer"
                        >
                          ✕
                        </button>
                      </div>

                      <div className="text-sm text-gray-600">
                        Selected file: <span className="font-medium">{fileName}</span>
                      </div>
                    </div>
                  )}
                </div>

                <Editor previewStyle="vertical" height="900px" initialEditType="markdown" initialValue={content} />
                <div className="flex items-center justify-end space-x-4 p-6">
                  <button className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded-lg shadow-sm">
                    Save Draft
                  </button>
                  <button
                    onClick={() => {
                      const data = getBlogData();
                      console.log(data);
                    }}
                    className="bg-red-500 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg shadow-sm"
                  >
                    Publish
                  </button>
                </div>
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
