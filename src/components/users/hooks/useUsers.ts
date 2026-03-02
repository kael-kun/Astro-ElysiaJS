import { useState, useEffect, useCallback } from "react";
import apiClient from "../../../services/apiClient";
import { getApiErrorMessage } from "../../../services/apiError";
import type { User, CreateUserInput, UpdateUserInput } from "../types/user";

interface UseUsersResult {
  users: User[];
  loading: boolean;
  error: string | null;
  page: number;
  limit: number;
  totalPages: number;
  totalUsers: number;
  itemsPerPage: number;
  fetchUsers: (pageNumber?: number) => Promise<void>;
  createUser: (data: CreateUserInput) => Promise<User>;
  updateUser: (id: string, data: UpdateUserInput) => Promise<User>;
  deleteUser: (userId: string) => Promise<void>;
  getUserBlogs: (userId: string) => Promise<unknown>;
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

export const useUsers = (): UseUsersResult => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPageState] = useState(getInitialPageFromURL);
  const [limit, setLimitState] = useState(getInitialLimitFromURL);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);

  const fetchUsers = useCallback(
    async (pageNumber: number = page) => {
      try {
        setLoading(true);
        setError(null);

        const response = await apiClient.get<{
          users: User[];
          total: number;
          page: number;
          totalPages: number;
        }>(`/api/users?page=${pageNumber}&limit=${limit}`);
        setUsers(response.data.users);
        setTotalUsers(response.data.total);
        setPageState(response.data.page);
        setTotalPages(response.data.totalPages);
      } catch (err) {
        const message = getApiErrorMessage(err);
        setError(message);
        console.error("Error fetching users:", err);
      } finally {
        setLoading(false);
      }
    },
    [page, limit],
  );

  const handleSetPage = useCallback(
    (newPage: number) => {
      if (newPage < 1) return;
      setPageState(newPage);
      updateURLWithPage(newPage, limit);
    },
    [limit],
  );

  const handleSetLimit = useCallback((newLimit: number) => {
    if (newLimit < 1) return;
    setLimitState(newLimit);
    setPageState(1);
    updateURLWithPage(1, newLimit);
  }, []);

  const createUser = useCallback(
    async (data: CreateUserInput): Promise<User> => {
      try {
        const response = await apiClient.post<User>("/api/user", data);
        await fetchUsers(page);
        return response.data;
      } catch (err) {
        const message = getApiErrorMessage(err);
        throw new Error(message);
      }
    },
    [fetchUsers, page],
  );

  const updateUser = useCallback(
    async (id: string, data: UpdateUserInput): Promise<User> => {
      try {
        const response = await apiClient.put<User>(`/api/user/${id}`, data);

        await fetchUsers(page);
        return response.data;
      } catch (err) {
        const message = getApiErrorMessage(err);
        throw new Error(message);
      }
    },
    [fetchUsers, page],
  );

  const deleteUser = useCallback(
    async (userId: string): Promise<void> => {
      try {
        await apiClient.delete(`/api/user/${userId}`);

        await fetchUsers(page);
      } catch (err) {
        const message = getApiErrorMessage(err);
        throw new Error(message);
      }
    },
    [fetchUsers, page],
  );

  const getUserBlogs = useCallback(async (userId: string): Promise<unknown> => {
    try {
      const response = await apiClient.get(`/api/user/${userId}/blogs`);
      return response.data;
    } catch (err) {
      const message = getApiErrorMessage(err);
      throw new Error(message);
    }
  }, []);

  useEffect(() => {
    fetchUsers(page);
  }, [page, fetchUsers]);

  return {
    users,
    loading,
    error,
    page,
    limit,
    totalPages,
    totalUsers,
    itemsPerPage: limit,
    fetchUsers,
    createUser,
    updateUser,
    deleteUser,
    getUserBlogs,
    setPage: handleSetPage,
    setLimit: handleSetLimit,
  };
};
