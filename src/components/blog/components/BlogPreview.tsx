import React, { useState } from "react";
import { Button, Card } from "src/components/ui";

interface BlogPreviewProps {
  content: string;
  showContent: boolean;
  onSave?: () => void;
  saving?: boolean;
  disabled?: boolean;
  status?: "draft" | "published";
  onStatusChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  statusOptions?: { value: string; label: string }[];
}

export function BlogPreview({
  content,
  showContent,
  onSave,
  saving = false,
  disabled = false,
  status = "draft",
  onStatusChange,
  statusOptions = [],
}: BlogPreviewProps) {
  if (!showContent) {
    return null;
  }

  const wordCount = content.split(/\s+/).filter((word) => word.length > 0).length;

  return (
    <Card shadow="lg" rounded="xl" className="overflow-hidden">
      <div className="flex flex-col space-y-4">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Blog Preview</h3>
          <div className="text-sm text-gray-600">Word count: {wordCount} words</div>
        </div>

        <div className="flex items-center justify-between px-6 pb-6">
          {onStatusChange && statusOptions.length > 0 ? (
            <div className="w-48">
              <select
                id="status"
                name="status"
                value={status}
                onChange={onStatusChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div />
          )}
          <Button variant="gradient" onClick={onSave} loading={saving} disabled={disabled}>
            {disabled ? "Generating..." : "Save"}
          </Button>
        </div>
      </div>
    </Card>
  );
}
