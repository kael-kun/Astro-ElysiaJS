import { useState, useEffect, useCallback } from "react";
import apiClient from "../../../services/apiClient";
import { getApiErrorMessage } from "../../../services/apiError";

export interface Blog {
  id: string;
  user_id: string;
  content: string | null;
  meta_description: string | null;
  status: "draft" | "published";
  image_url: string | null;
  project_id: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  id: string;
  name: string;
  description: string | null;
}

interface UseProjectBlogsResult {
  blogs: Blog[];
  project: Project | null;
  loading: boolean;
  error: string | null;
  page: number;
  totalPages: number;
  total: number;
  fetchBlogs: (page?: number) => Promise<void>;
  createBlog: (content: string, metaDescription?: string) => Promise<Blog>;
  updateBlog: (id: string, data: Partial<Blog>) => Promise<Blog>;
  deleteBlog: (id: string) => Promise<void>;
  publishBlog: (id: string) => Promise<Blog>;
}

const ITEMS_PER_PAGE = 10;

function getProjectIdFromURL(): string | null {
  if (typeof window === "undefined") return null;
  const params = new URLSearchParams(window.location.search);
  return params.get("projectId");
}

export const useProjectBlogs = (): UseProjectBlogsResult => {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [total, setTotal] = useState(0);

  const projectId = getProjectIdFromURL();

  const fetchProject = useCallback(async () => {
    if (!projectId) return;
    
    try {
      const response = await apiClient.get<Project>(`/api/project/${projectId}`);
      setProject(response.data);
    } catch (err) {
      console.error("Failed to fetch project:", err);
    }
  }, [projectId]);

  const fetchBlogs = useCallback(async (pageNum = 1) => {
    if (!projectId) {
      setBlogs([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const limit = ITEMS_PER_PAGE;
      const offset = (pageNum - 1) * limit;

      const response = await apiClient.get<{ results: Blog[]; total: number; page: number; totalPages: number }>(
        `/api/blogs?projectId=${projectId}&limit=${limit}&offset=${offset}`
      );

      setBlogs(response.data.results);
      setPage(response.data.page);
      setTotalPages(response.data.totalPages);
      setTotal(response.data.total);
    } catch (err) {
      const message = getApiErrorMessage(err);
      setError(message);
      console.error("Error fetching blogs:", err);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  const createBlog = useCallback(async (content: string, metaDescription?: string): Promise<Blog> => {
    if (!projectId) throw new Error("No project selected");

    const response = await apiClient.post<Blog>("/api/blog", {
      user_id: "current", // Will be set by backend from auth
      content,
      meta_description: metaDescription,
      status: "draft",
      project_id: projectId,
    });

    await fetchBlogs();
    return response.data;
  }, [projectId, fetchBlogs]);

  const updateBlog = useCallback(async (id: string, data: Partial<Blog>): Promise<Blog> => {
    const response = await apiClient.put<Blog>(`/api/blog/${id}`, data);
    await fetchBlogs();
    return response.data;
  }, [fetchBlogs]);

  const deleteBlog = useCallback(async (id: string): Promise<void> => {
    await apiClient.delete(`/api/blog/${id}`);
    await fetchBlogs();
  }, [fetchBlogs]);

  const publishBlog = useCallback(async (id: string): Promise<Blog> => {
    const response = await apiClient.post<Blog>(`/api/blog/${id}/publish`);
    await fetchBlogs();
    return response.data;
  }, [fetchBlogs]);

  useEffect(() => {
    fetchProject();
  }, [fetchProject]);

  useEffect(() => {
    fetchBlogs();
  }, [fetchBlogs]);

  return {
    blogs,
    project,
    loading,
    error,
    page,
    totalPages,
    total,
    fetchBlogs,
    createBlog,
    updateBlog,
    deleteBlog,
    publishBlog,
  };
};
