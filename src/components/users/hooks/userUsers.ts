import { useState, useEffect, useCallback } from "react";
import fetchClient from "../../../services/fetchClient";
import type { User, CreateUserInput, UpdateUserInput } from "../types/user";

interface UseUsersResult {
  users: User[];
  loading: boolean;
  error: string | null;
  page: number;
  totalPages: number;
  totalUsers: number;
  itemsPerPage: number;
  fetchUsers: (pageNumber?: number) => Promise<void>;
  createUser: (data: CreateUserInput) => Promise<User>;
  updateUser: (data: UpdateUserInput) => Promise<User>;
  deleteUser: (userId: string) => Promise<void>;
  getUserBlogs: (userId: string) => Promise<unknown>;
  setPage: (page: number) => void;
}

const ITEMS_PER_PAGE = 10;

export const useUsers = (): UseUsersResult => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);

  const fetchUsers = useCallback(async (pageNumber: number = 1) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetchClient.get<{
        users: User[];
        total: number;
        page: number;
        totalPages: number;
      }>(`/api/users?page=${pageNumber}&limit=${ITEMS_PER_PAGE}`);

      setUsers(response.users);
      setTotalUsers(response.total);
      setPage(response.page);
      setTotalPages(response.totalPages);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to fetch users";
      setError(message);
      console.error("Error fetching users:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const createUser = useCallback(async (data: CreateUserInput): Promise<User> => {
    try {
      const newUser = await fetchClient.post<User>("/api/users", data);
      await fetchUsers(page);
      return newUser;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to create user";
      throw new Error(message);
    }
  }, [fetchUsers, page]);

  const updateUser = useCallback(async (data: UpdateUserInput): Promise<User> => {
    try {
      const updatedUser = await fetchClient.put<User>(`/api/users/${data.id}`, data);
      await fetchUsers(page);
      return updatedUser;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to update user";
      throw new Error(message);
    }
  }, [fetchUsers, page]);

  const deleteUser = useCallback(async (userId: string): Promise<void> => {
    try {
      await fetchClient.delete(`/api/users/${userId}`);
      await fetchUsers(page);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to delete user";
      throw new Error(message);
    }
  }, [fetchUsers, page]);

  const getUserBlogs = useCallback(async (userId: string): Promise<unknown> => {
    try {
      const blogs = await fetchClient.get(`/api/users/${userId}/blogs`);
      return blogs;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to fetch user blogs";
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
    totalPages,
    totalUsers,
    itemsPerPage: ITEMS_PER_PAGE,
    fetchUsers,
    createUser,
    updateUser,
    deleteUser,
    getUserBlogs,
    setPage,
  };
};