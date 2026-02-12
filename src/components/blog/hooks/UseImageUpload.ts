import { useState } from "react";

export const useImageUpload = () => {
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

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
    reader.onload = () => setPreviewImage(reader.result as string);
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const removeImage = () => {
    setPreviewImage(null);
    setFileName(null);
    setUploadedFile(null);
  };

  return {
    previewImage,
    fileName,
    uploadedFile,
    uploadError: error,
    handleFileUpload,
    removeImage,
  };
};