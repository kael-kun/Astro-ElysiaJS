import React, { useState } from "react";
import { Button, Card, Select } from "../ui";

interface BlogPreviewProps {
  content: string;
  uploadedFile: File | null;
  onSaveDraft: () => void;
  onPublish: () => void;
  showContent: boolean;
  onSave?: () => void;
  saving?: boolean;
}

const statusOptions = [
  { value: "draft", label: "Save as Draft" },
  { value: "publish", label: "Publish" },
];

export function BlogPreview({ 
  content, 
  uploadedFile, 
  onSaveDraft, 
  onPublish,
  showContent,
  onSave,
  saving = false
}: BlogPreviewProps) {
  const [status, setStatus] = useState<"draft" | "publish">("draft");

  if (!showContent) {
    return null;
  }

  const wordCount = content.split(/\s+/).filter(word => word.length > 0).length;

  const handleSave = () => {
    if (onSave) {
      onSave();
    } else if (status === "draft") {
      onSaveDraft();
    } else {
      onPublish();
    }
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatus(e.target.value as "draft" | "publish");
  };

  return (
    <Card shadow="lg" rounded="xl" className="overflow-hidden">
      <div className="flex flex-col space-y-4">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Blog Preview</h3>
          <div className="text-sm text-gray-600">
            Word count: {wordCount} words
          </div>
          {uploadedFile && (
            <div className="text-sm text-gray-600 mt-1">
              Image attached: {uploadedFile.name}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between px-6">
          <div className="w-48">
            <Select
              id="status"
              name="status"
              label="Status"
              value={status}
              onChange={handleStatusChange}
              options={statusOptions}
            />
          </div>
          <Button
            variant="gradient"
            onClick={handleSave}
            loading={saving}
          >
            Save
          </Button>
        </div>
      </div>
    </Card>
  );
}