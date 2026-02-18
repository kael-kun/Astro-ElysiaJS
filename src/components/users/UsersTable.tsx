import React, { useState } from "react";
import { Table, TableActions, Column } from "../ui/Table";
import { UserInfoModal } from "./UserInfoModal";
import type { User } from "./types/user";

interface UsersTableProps {
  users: User[];
  loading: boolean;
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
}

export const UsersTable: React.FC<UsersTableProps> = ({ users, loading, onEdit, onDelete }) => {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleView = (user: User) => {
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
      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${config.className}`}>
        {config.label}
      </span>
    );
  };

  const renderDate = (dateString: string) => (
    <div className="text-sm text-gray-500">{new Date(dateString).toLocaleDateString()}</div>
  );

  const renderActions = (_value: unknown, user: User, _index: number) => (
    <TableActions item={user} onView={handleView} onEdit={onEdit} onDelete={onDelete} />
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
      render: (count = 0) => <div className="text-sm text-gray-500">{count}</div>,
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

      {selectedUser && <UserInfoModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} user={selectedUser} />}
    </>
  );
};
