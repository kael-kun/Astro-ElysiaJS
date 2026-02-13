import { useCallback } from "react";

interface BlogDraft {
  form: {
    topic: string;
    keywords: string;
    tone: string;
    audience: string;
  };
  content: string;
  fileName: string | null;
  uploadedFile: File | null;
}

const DRAFT_KEY = "blog-draft";

export const useDraftManager = () => {
  const saveDraft = useCallback((data: BlogDraft): void => {
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(data));
    } catch (error) {
      console.error("Failed to save draft:", error);
    }
  }, []);

  const loadDraft = useCallback((): BlogDraft | null => {
    try {
      const draft = localStorage.getItem(DRAFT_KEY);
      return draft ? JSON.parse(draft) : null;
    } catch (error) {
      console.error("Failed to load draft:", error);
      return null;
    }
  }, []);

  const clearDraft = useCallback((): void => {
    try {
      localStorage.removeItem(DRAFT_KEY);
    } catch (error) {
      console.error("Failed to clear draft:", error);
    }
  }, []);

  const hasDraft = useCallback((): boolean => {
    return localStorage.getItem(DRAFT_KEY) !== null;
  }, []);

  return {
    saveDraft,
    loadDraft,
    clearDraft,
    hasDraft,
  };
};