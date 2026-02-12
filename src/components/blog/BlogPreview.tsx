import React from "react";

interface BlogPreviewProps {
  content: string;
  uploadedFile: File | null;
  onSaveDraft: () => void;
  onPublish: () => void;
  showContent: boolean;
}

export function BlogPreview({ 
  content, 
  uploadedFile, 
  onSaveDraft, 
  onPublish,
  showContent 
}: BlogPreviewProps) {
  if (!showContent) {
    return null;
  }

  const getBlogData = () => {
    return {
      content,
      file: uploadedFile,
    };
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100">
      <div className="flex flex-col space-y-4">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Blog Preview</h3>
          <div className="text-sm text-gray-600">
            Word count: {content.split(/\s+/).filter(word => word.length > 0).length} words
          </div>
          {uploadedFile && (
            <div className="text-sm text-gray-600">
              Image attached: {uploadedFile.name}
            </div>
          )}
        </div>

        <div className="flex items-center justify-end space-x-4 p-6">
          <button 
            onClick={onSaveDraft}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded-lg shadow-sm transition-colors"
          >
            Save Draft
          </button>
          <button
            onClick={() => {
              const data = getBlogData();
              console.log("Publishing blog data:", data);
              onPublish();
            }}
            className="bg-red-500 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg shadow-sm transition-colors"
          >
            Publish
          </button>
        </div>
      </div>
    </div>
  );
}