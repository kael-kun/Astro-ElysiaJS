import React from "react";

export interface BlogFormValues {
  topic: string;
  keywords: string;
  tone: string;
  audience: string;
}

interface BlogFormProps {
  form: BlogFormValues;
  loading: boolean;
  error: string | null;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  onSubmit: (e: React.SyntheticEvent<HTMLFormElement>) => void;
}

export function BlogForm({ form, loading, error, onChange, onSubmit }: BlogFormProps) {
  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 md:p-8">
      <form onSubmit={onSubmit}>
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Topic <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="topic"
              value={form.topic}
              onChange={onChange}
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
              onChange={onChange}
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
              onChange={onChange}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all outline-none placeholder:text-gray-400"
              placeholder="e.g., Marketing professionals, business owners"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Tone</label>
            <select
              name="tone"
              value={form.tone}
              onChange={onChange}
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
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {error}
            </div>
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
                Generating...
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
  );
}