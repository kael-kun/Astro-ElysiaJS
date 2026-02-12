import { useState } from "react";
import  {getAuthHeaders} from "../../../services/fetchClient";

export const useBlogGenerator = () => {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateBlog = async (form: { topic: string; keywords: string; tone: string; audience: string }) => {
    setLoading(true);
    setError(null);
    setContent("");

    try {
        const headers =getAuthHeaders();
        const hostOrigin = window.location.origin;
       const response = await fetch(`${hostOrigin}/api/generate-blog`, {
        method: "POST",
        headers: headers,
        body: JSON.stringify(form),
      });
      console.log(response);

      if (!response.ok || !response.body) throw new Error("Failed to generate blog.");

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
            const json = JSON.parse(trimmed.replace(/^data:\s*/, ""));
            if (json.response) setContent((prev) => prev + json.response);
          } catch (err) {
            console.warn("Failed to parse chunk:", trimmed);
          }
        }
      }

      // Handle leftover
      if (buffer.startsWith("data: ")) {
        try {
          const json = JSON.parse(buffer.replace(/^data:\s*/, ""));
          if (json.response) setContent((prev) => prev + json.response);
        } catch {}
      }
    } catch (err) {
      setError("Error generating blog content. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return { content, loading, error, generateBlog };
};


