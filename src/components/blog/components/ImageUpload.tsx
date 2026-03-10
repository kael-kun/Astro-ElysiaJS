import React from "react";

interface ImageUploadProps {
  previewImage: string | null;
  fileName: string | null;
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveImage: () => void;
  onImageError?: () => void;
  label?: string;
}

export function ImageUpload({
  previewImage,
  fileName,
  onFileUpload,
  onRemoveImage,
  onImageError,
  label = "Upload Image (Thumbnails)",
}: ImageUploadProps) {
  return (
    <div className="p-6 border-b border-gray-100">
      {!previewImage ? (
        <label className="flex flex-col items-center justify-center w-full h-40 bg-gray-100 rounded-xl cursor-pointer hover:bg-gray-200 transition-all border border-gray-200">
          <svg className="w-10 h-10 text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <p className="mb-2 text-sm text-gray-500">
            <span className="font-semibold">Click to upload</span>
          </p>
          <p className="text-xs text-gray-400">PNG, JPG up to 5MB</p>

          <input type="file" className="hidden" accept="image/*" onChange={onFileUpload} />
        </label>
      ) : (
        <div className="flex flex-col gap-3">
          <label className="block text-sm font-semibold text-gray-700 mb-3">{label}</label>
          <div className="relative w-full max-w-sm">
            <img
              src={previewImage}
              alt="Preview"
              className="rounded-lg border border-gray-200 shadow-sm"
              onError={() => onImageError?.()}
            />
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
