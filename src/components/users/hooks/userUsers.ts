import { useState, useEffect } from "react";
import fetchClient from "../../../services/fetchClient";
import type { User, CreateUserInput, UpdateUserInput } from "../types/user";

export const useUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const ITEMS_PER_PAGE = 10;

  const fetchUsers = async (pageNumber: number = 1) => {
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
    } catch (err: any) {
      setError(err.message || "Failed to fetch users");
      console.error("Error fetching users:", err);
    } finally {
      setLoading(false);
    }
  };

  const createUser = async (data: CreateUserInput) => {
    try {
      const newUser = await fetchClient.post<User>("/api/users", data);
      await fetchUsers(page); // Refresh the list
      return newUser;
    } catch (err: any) {
      throw new Error(err.message || "Failed to create user");
    }
  };

  const updateUser = async (data: UpdateUserInput) => {
    try {
      const updatedUser = await fetchClient.put<User>(
        `/api/users/${data.id}`,
        data
      );
      await fetchUsers(page); // Refresh the list
      return updatedUser;
    } catch (err: any) {
      throw new Error(err.message || "Failed to update user");
    }
  };

  const deleteUser = async (userId: string) => {
    try {
      await fetchClient.delete(`/api/users/${userId}`);
      await fetchUsers(page); // Refresh the list
    } catch (err: any) {
      throw new Error(err.message || "Failed to delete user");
    }
  };

  const getUserBlogs = async (userId: string) => {
    try {
      const blogs = await fetchClient.get(`/api/users/${userId}/blogs`);
      return blogs;
    } catch (err: any) {
      throw new Error(err.message || "Failed to fetch user blogs");
    }
  };

  useEffect(() => {
    fetchUsers(page);
  }, [page]);

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