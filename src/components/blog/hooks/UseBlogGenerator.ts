import { useState, useCallback } from "react";
import { getAuthHeaders } from "../../../services/fetchClient";

export interface BlogFormData {
  topic: string;
  keywords: string;
  tone: string;
  audience: string;
}

export interface BlogGeneratorResult {
  content: string;
  loading: boolean;
  error: string | null;
  generateBlog: (form: BlogFormData) => Promise<void>;
}

interface StreamChunk {
  response?: string;
  error?: string;
}

export const useBlogGenerator = (): BlogGeneratorResult => {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateBlog = useCallback(async (form: BlogFormData): Promise<void> => {
    setLoading(true);
    setError(null);
    setContent("");

    try {
      const headers = getAuthHeaders();
      const hostOrigin = window.location.origin;
      const response = await fetch(`${hostOrigin}/api/generate-blog`, {
        method: "POST",
        headers,
        body: JSON.stringify(form),
      });

      if (!response.ok || !response.body) {
        throw new Error("Failed to generate blog.");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || !trimmed.startsWith("data: ")) continue;

          try {
            const json: StreamChunk = JSON.parse(trimmed.replace(/^data:\s*/, ""));
            if (json.response) {
              setContent((prev) => prev + json.response);
            }
            if (json.error) {
              setError(json.error);
            }
          } catch {
            console.warn("Failed to parse chunk:", trimmed);
          }
        }
      }

      // Handle leftover
      if (buffer.startsWith("data: ")) {
        try {
          const json: StreamChunk = JSON.parse(buffer.replace(/^data:\s*/, ""));
          if (json.response) {
            setContent((prev) => prev + json.response);
          }
          if (json.error) {
            setError(json.error);
          }
        } catch {
          // Ignore parsing errors for leftover buffer
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error generating blog content. Please try again.";
      setError(errorMessage);
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  return { content, loading, error, generateBlog };
};
