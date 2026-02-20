import { useState, useEffect, useCallback } from "react";
import apiClient from "../../../services/apiClient";
import { getApiErrorMessage } from "../../../services/apiError";

export interface ProjectOption {
  id: string;
  name: string;
  description: string | null;
  user_name?: string;
  createdAt?: string;
}

interface UseProjectSelectorResult {
  projects: ProjectOption[];
  loading: boolean;
  error: string | null;
  selectedProjectId: string | null;
  setSelectedProjectId: (id: string | null) => void;
}

function getProjectIdFromURL(): string | null {
  if (typeof window === "undefined") return null;
  const params = new URLSearchParams(window.location.search);
  return params.get("projectId");
}

export const useProjectSelector = (): UseProjectSelectorResult => {
  const [projects, setProjects] = useState<ProjectOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProjectId, setSelectedProjectIdState] = useState<string | null>(getProjectIdFromURL);

  const fetchProjects = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.get<{ projects: ProjectOption[] }>("/api/projects?limit=100");
      setProjects(response.data.projects);
    } catch (err) {
      const message = getApiErrorMessage(err);
      setError(message);
      console.error("Error fetching projects:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const setSelectedProjectId = useCallback((id: string | null) => {
    setSelectedProjectIdState(id);
    if (id) {
      window.location.href = `/dashboard/blogs?projectId=${id}`;
    } else {
      window.location.href = "/dashboard/blogs";
    }
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  return {
    projects,
    loading,
    error,
    selectedProjectId,
    setSelectedProjectId,
  };
};
