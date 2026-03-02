import { useState, useEffect, useCallback } from "react";
import apiClient from "../../../services/apiClient";
import { getApiErrorMessage } from "../../../services/apiError";
import type { Project, CreateProjectInput, UpdateProjectInput } from "../types/project";

interface UseProjectsResult {
  projects: Project[];
  loading: boolean;
  error: string | null;
  page: number;
  limit: number;
  totalPages: number;
  totalProjects: number;
  itemsPerPage: number;
  fetchProjects: (pageNumber?: number) => Promise<void>;
  createProject: (data: CreateProjectInput) => Promise<Project>;
  updateProject: (data: UpdateProjectInput & { id: string }) => Promise<Project>;
  deleteProject: (projectId: string) => Promise<void>;
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;
}

const ITEMS_PER_PAGE = 10;

function getInitialPageFromURL(): number {
  if (typeof window === "undefined") return 1;
  const params = new URLSearchParams(window.location.search);
  const pageParam = params.get("page");
  const parsed = parseInt(pageParam || "1", 10);
  return isNaN(parsed) || parsed < 1 ? 1 : parsed;
}

function getInitialLimitFromURL(): number {
  if (typeof window === "undefined") return ITEMS_PER_PAGE;
  const params = new URLSearchParams(window.location.search);
  const limitParam = params.get("limit");
  const parsed = parseInt(limitParam || String(ITEMS_PER_PAGE), 10);
  return isNaN(parsed) || parsed < 1 ? ITEMS_PER_PAGE : parsed;
}

function updateURLWithPage(page: number, limit: number): void {
  if (typeof window === "undefined") return;
  const url = new URL(window.location.href);
  url.searchParams.set("page", String(page));
  url.searchParams.set("limit", String(limit));
  window.history.pushState({}, "", url.toString());
}

export const useProjects = (): UseProjectsResult => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPageState] = useState(getInitialPageFromURL);
  const [limit, setLimitState] = useState(getInitialLimitFromURL);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProjects, setTotalProjects] = useState(0);

  const fetchProjects = useCallback(
    async (pageNumber: number = page) => {
      try {
        setLoading(true);
        setError(null);

        const response = await apiClient.get<{
          projects: Project[];
          total: number;
          page: number;
          totalPages: number;
        }>(`/api/projects?page=${pageNumber}&limit=${limit}`);

        setProjects(response.data.projects);
        setTotalProjects(response.data.total);
        setPageState(response.data.page);
        setTotalPages(response.data.totalPages);
      } catch (err) {
        const message = getApiErrorMessage(err);
        setError(message);
        console.error("Error fetching projects:", err);
      } finally {
        setLoading(false);
      }
    },
    [page, limit],
  );

  const handleSetPage = useCallback((newPage: number) => {
    if (newPage < 1) return;
    setPageState(newPage);
    updateURLWithPage(newPage, limit);
  }, [limit]);

  const handleSetLimit = useCallback((newLimit: number) => {
    if (newLimit < 1) return;
    setLimitState(newLimit);
    setPageState(1);
    updateURLWithPage(1, newLimit);
  }, []);

  const createProject = useCallback(
    async (data: CreateProjectInput): Promise<Project> => {
      try {
        const response = await apiClient.post<Project>("/api/project", data);
        await fetchProjects(page);
        return response.data;
      } catch (err) {
        const message = getApiErrorMessage(err);
        throw new Error(message);
      }
    },
    [fetchProjects, page],
  );

  const updateProject = useCallback(
    async (data: UpdateProjectInput & { id: string }): Promise<Project> => {
      try {
        const payload = {
          name: data.name,
          description: data.description,
        };
        const response = await apiClient.put<Project>(`/api/project/${data.id}`, payload);
        await fetchProjects(page);
        return response.data;
      } catch (err) {
        const message = getApiErrorMessage(err);
        throw new Error(message);
      }
    },
    [fetchProjects, page],
  );

  const deleteProject = useCallback(
    async (projectId: string): Promise<void> => {
      try {
        await apiClient.delete(`/api/project/${projectId}`);
        await fetchProjects(page);
      } catch (err) {
        const message = getApiErrorMessage(err);
        throw new Error(message);
      }
    },
    [fetchProjects, page],
  );

  useEffect(() => {
    fetchProjects(page);
  }, [page, fetchProjects]);

  return {
    projects,
    loading,
    error,
    page,
    limit,
    totalPages,
    totalProjects,
    itemsPerPage: limit,
    fetchProjects,
    createProject,
    updateProject,
    deleteProject,
    setPage: handleSetPage,
    setLimit: handleSetLimit,
  };
};
