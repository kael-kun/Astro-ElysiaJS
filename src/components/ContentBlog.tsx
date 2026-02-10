import { useState, useEffect, useRef } from "react";
import "@toast-ui/editor/dist/toastui-editor.css";
import { Editor } from "@toast-ui/react-editor";

type FormValues = {
  topic: string;
  keywords: string;
  tone: string;
  audience: string;
};

export function ContentBlog() {
  const [form, setForm] = useState<FormValues>({
    topic: "",
    keywords: "",
    tone: "professional",
    audience: "",
  });

  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const editorRef = useRef<Editor>(null);
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
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
    setContent(""); // reset content in state
    const editor = editorRef.current?.getInstance();
    if (editor) {
      editor.setMarkdown(""); // clear editor visually
    }

    try {
      const hostOrigin = window.location.origin;
      const payload = {
        topic: form.topic,
        keywords: form.keywords,
        tone: form.tone,
        audience: form.audience,
      };

      console.log("Submitting blog generation request...", payload);

      const response = await fetch(`${hostOrigin}/api/generate-blog`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok || !response.body) {
        throw new Error("Failed to generate blog content.");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let done = false;
      let buffer = "";

      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;

        if (value) {
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed || !trimmed.startsWith("data: ")) continue;

            const jsonStr = trimmed.replace(/^data:\s*/, "");
            try {
              const json = JSON.parse(jsonStr);
              if (json.response) {
                const newChunk = json.response;

                // Update React state (for saving, etc.)
                setContent((prev) => prev + newChunk);

                // ✨ Typing effect: append to editor
                if (editor) {
                  const currentMarkdown = editor.getMarkdown();
                  editor.setMarkdown(currentMarkdown + newChunk);
                  // Optional: scroll to bottom
                  const container = editor.getRootElement();
                  if (container) {
                    container.scrollTop = container.scrollHeight;
                  }
                }
              }
            } catch (err) {
              console.warn("Failed to parse JSON chunk:", jsonStr, err);
            }
          }
        }
      }

      // Handle leftover buffer
      if (buffer.startsWith("data: ")) {
        try {
          const json = JSON.parse(buffer.replace(/^data:\s*/, ""));
          if (json.response) {
            const finalChunk = json.response;
            setContent((prev) => prev + finalChunk);
            if (editor) {
              const currentMarkdown = editor.getMarkdown();
              editor.setMarkdown(currentMarkdown + finalChunk);
            }
          }
        } catch (err) {
          console.warn("Failed to parse remaining buffer:", buffer, err);
        }
      }
    } catch (err) {
      console.error("Error in handleSubmit:", err);
      setError("Error generating blog content. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Optional: simulate junk insertion (like typing effect)
  useEffect(() => {
    if (!content) return;
    const editor = editorRef.current?.getInstance();
    if (!editor) return;

    editor.setMarkdown(content);
  }, [content]);
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

                <Editor
                  ref={editorRef}
                  previewStyle="vertical"
                  height="900px"
                  initialEditType="markdown"
                  initialValue="" // start empty
                />
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
  return `# Toyota Fortuner: The Ultimate Car for Business Success\n\nAs a businessman, you understand the importance of making the right impression. Whether it's a meeting with potential investors or a networking event, you want to arrive in style and confidence. That's where the Toyota Fortuner comes in – a rugged, reliable, and feature-packed car that's designed to help you achieve your business goals.\n\n## Unparalleled Reliability\n\nThe Toyota Fortuner is built on a reputation for reliability, with a strong and durable engine that can withstand the demands of daily use. With a 2.8-liter turbocharged diesel engine producing 177 horsepower, you'll have the power and torque you need to tackle any terrain or load. Plus, with a 10-year/160,000 km warranty, you can drive away with confidence knowing you're protected.\n\n### Key Features:\n\n* 2.8-liter turbocharged diesel engine\n* 177 horsepower and 420 Nm of torque\n* 10-year/160,000 km warranty\n\n## Intelligent Technology\n\nThe Toyota Fortuner is equipped with a range of intelligent technologies designed to make your life easier and more efficient. From the intuitive touchscreen infotainment system to the advanced safety features, you'll be well-prepared for any situation.\n\n`;
};
