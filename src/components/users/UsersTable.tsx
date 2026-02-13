import React, { useState } from "react";
import { Table, TableActions, Column } from "../ui/Table";
import { UserInfoModal } from "./UserInfoModal";
import type { User } from "./types/user";

interface UsersTableProps {
  users: User[];
  loading: boolean;
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
  onViewBlogs: (user: User) => void;
}

export const UsersTable: React.FC<UsersTableProps> = ({
  users,
  loading,
  onEdit,
  onDelete,
  onViewBlogs,
}) => {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleViewDetails = (user: User) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const renderUserName = (name: string, user: User) => (
    <div className="flex items-center">
      <div className="flex-shrink-0 h-10 w-10">
        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center text-white font-semibold">
          {name.charAt(0).toUpperCase()}
        </div>
      </div>
      <div className="ml-4">
        <div className="text-sm font-medium text-gray-900">{name}</div>
      </div>
    </div>
  );

  const renderRole = (role: string) => {
    const roleConfig = {
      admin: {
        className: "bg-red-100 text-red-800",
        label: "Admin",
      },
      client: {
        className: "bg-blue-100 text-blue-800",
        label: "Client",
      },
    };

    const config = roleConfig[role as keyof typeof roleConfig] || roleConfig.client;

    return (
      <span
        className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${config.className}`}
      >
        {config.label}
      </span>
    );
  };

  const renderDate = (dateString: string) => (
    <div className="text-sm text-gray-500">
      {new Date(dateString).toLocaleDateString()}
    </div>
  );

  const renderActions = (user: User) => (
    <TableActions
      item={user}
      onView={handleViewDetails}
      onEdit={onEdit}
      onDelete={onDelete}
      actions={[
        {
          label: "View Blogs",
          icon: (
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          ),
          onClick: onViewBlogs,
          variant: "secondary",
        },
      ]}
    />
  );

  const columns: Column<User>[] = [
    {
      key: "name",
      label: "Name",
      render: renderUserName,
      sortable: true,
    },
    {
      key: "email",
      label: "Email",
      sortable: true,
    },
    {
      key: "role",
      label: "Role",
      render: renderRole,
      sortable: true,
    },
    {
      key: "blogsCount",
      label: "Blogs",
      align: "center",
      render: (count = 0) => (
        <div className="text-sm text-gray-500">{count}</div>
      ),
    },
    {
      key: "createdAt",
      label: "Created",
      render: renderDate,
      sortable: true,
    },
    {
      key: "actions",
      label: "Actions",
      align: "right",
      render: renderActions,
    },
  ];

  return (
    <>
      <Table<User>
        data={users}
        columns={columns}
        loading={loading}
        keyField="id"
        rowClassName={(user) => "hover:bg-gray-50"}
      />

      {selectedUser && (
        <UserInfoModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          user={selectedUser}
        />
      )}
    </>
  );
};