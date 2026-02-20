import React from "react";
import { Button, Card } from "src/components/ui";

interface ImageUploadProps {
  previewImage: string | null;
  fileName: string | null;
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveImage: () => void;
  label?: string;
}

export function ImageUpload({
  previewImage,
  fileName,
  onFileUpload,
  onRemoveImage,
  label = "Upload Image (Thumbnails)",
}: ImageUploadProps) {
  return (
    <div className="p-6 border-b border-gray-100">
      <label className="block text-sm font-semibold text-gray-700 mb-3">{label}</label>

      {!previewImage ? (
        <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:bg-gray-50 transition-all">
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <svg className="w-10 h-10 text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

          <input type="file" className="hidden" accept="image/*" onChange={onFileUpload} />
        </label>
      ) : (
        <div className="flex flex-col gap-3">
          <div className="relative w-full max-w-sm">
            <img src={previewImage} alt="Preview" className="rounded-lg border border-gray-200 shadow-sm" />
            <button
              type="button"
              onClick={onRemoveImage}
              className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-600 transition cursor-pointer"
              aria-label="Remove image"
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
  );
}
