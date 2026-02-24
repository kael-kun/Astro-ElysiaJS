import { useState, useCallback } from "react";
import apiClient from "../../../services/apiClient";
import { getApiErrorMessage } from "../../../services/apiError";

export interface ApiKey {
  id: string;
  project_id: string;
  key_prefix: string;
  name: string;
  last_used_at: string | null;
  createdAt: string;
  is_active: boolean;
}

export interface ApiKeyWithFullKey extends ApiKey {
  fullKey: string;
}

interface UseApiKeysResult {
  apiKeys: ApiKey[];
  loading: boolean;
  error: string | null;
  fetchApiKeys: (projectId: string) => Promise<void>;
  createApiKey: (projectId: string, name: string) => Promise<ApiKeyWithFullKey>;
  deleteApiKey: (keyId: string) => Promise<void>;
}

export function useApiKeys(): UseApiKeysResult {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchApiKeys = useCallback(async (projectId: string) => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.get<ApiKey[]>(`/api/project/${projectId}/keys`);
      setApiKeys(response.data);
    } catch (err) {
      const message = getApiErrorMessage(err);
      setError(message);
      console.error("Error fetching API keys:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const createApiKey = useCallback(async (projectId: string, name: string): Promise<ApiKeyWithFullKey> => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.post<ApiKeyWithFullKey>(`/api/project/${projectId}/keys`, { name });
      setApiKeys((prev) => [response.data, ...prev]);
      return response.data;
    } catch (err) {
      const message = getApiErrorMessage(err);
      setError(message);
      console.error("Error creating API key:", err);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteApiKey = useCallback(async (keyId: string) => {
    setLoading(true);
    setError(null);

    try {
      await apiClient.delete(`/api/keys/${keyId}`);
      setApiKeys((prev) => prev.filter((key) => key.id !== keyId));
    } catch (err) {
      const message = getApiErrorMessage(err);
      setError(message);
      console.error("Error deleting API key:", err);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    apiKeys,
    loading,
    error,
    fetchApiKeys,
    createApiKey,
    deleteApiKey,
  };
}
