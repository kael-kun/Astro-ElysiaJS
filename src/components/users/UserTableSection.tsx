import React from "react";
import { Card } from "../ui/Card";
import { UsersTable } from "./UsersTable";
import { Pagination } from "./Pagination";
import type { User } from "./types/user";

export interface UserTableSectionProps {
  users: User[];
  loading: boolean;
  error: string | null;
  page: number;
  totalPages: number;
  totalUsers: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
  onViewBlogs: (user: User) => void;
}

export const UserTableSection: React.FC<UserTableSectionProps> = ({
  users,
  loading,
  error,
  page,
  totalPages,
  totalUsers,
  itemsPerPage,
  onPageChange,
  onEdit,
  onDelete,
  onViewBlogs,
}) => {
  return (
    <Card shadow="md" rounded="lg" className="overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Users List</h2>
      </div>

      <UsersTable users={users} loading={loading} onEdit={onEdit} onDelete={onDelete} onViewBlogs={onViewBlogs} />

      <Pagination
        currentPage={page}
        totalPages={totalPages}
        onPageChange={onPageChange}
        totalItems={totalUsers}
        itemsPerPage={itemsPerPage}
      />
    </Card>
  );
};
