import React, { useState } from "react";
import { UserStats } from "./UserStats";
import { UserActions } from "./UserActions";
import { UserTableSection } from "./UserTableSection";
import { UserModal } from "./UserModal";
import { ConfirmModal } from "../ui/ConfirmModal";
import { useUsers } from "./hooks/userUsers";
import { useToast } from "../../hooks/useToast";
import type { User } from "./types/user";

export function UsersManagement() {
  const {
    users,
    loading,
    error,
    page,
    totalPages,
    totalUsers,
    itemsPerPage,
    createUser,
    updateUser,
    deleteUser,
    getUserBlogs,
    setPage,
  } = useUsers();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);
  
  const { success, error: showError } = useToast();

  const handleAddUser = () => {
    setEditingUser(null);
    setModalError(null);
    setIsModalOpen(true);
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setModalError(null);
    setIsModalOpen(true);
  };

  const handleDeleteUser = (user: User) => {
    setUserToDelete(user);
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    if (!userToDelete) return;

    try {
      setModalLoading(true);
      await deleteUser(userToDelete.id);
      success(`User "${userToDelete.name}" has been deleted successfully.`);
      setShowDeleteConfirm(false);
      setUserToDelete(null);
    } catch (err: any) {
      showError(err.message || "Failed to delete user");
    } finally {
      setModalLoading(false);
    }
  };

  const handleViewBlogs = async (user: User) => {
    try {
      const blogs = await getUserBlogs(user.id) as { length: number };
      success(`${user.name} has ${blogs.length} blog${blogs.length !== 1 ? 's' : ''}`);
    } catch (err: any) {
      showError(err.message || "Failed to fetch user blogs");
    }
  };

  const handleSubmit = async (data: any) => {
    try {
      setModalLoading(true);
      setModalError(null);
      
      if (editingUser) {
        await updateUser(data);
        success(`User "${data.name}" has been updated successfully.`);
      } else {
        await createUser(data);
        success(`User "${data.name}" has been created successfully.`);
      }
      
      setIsModalOpen(false);
      setEditingUser(null);
    } catch (err: any) {
      setModalError(err.message || "Failed to save user. Please try again.");
      throw err;
    } finally {
      setModalLoading(false);
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <UserActions onAddUser={handleAddUser} />
      
      <UserStats 
        users={users}
        totalUsers={totalUsers}
        loading={loading}
      />

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
          {error}
        </div>
      )}

      <UserTableSection
        users={users}
        loading={loading}
        error={error}
        page={page}
        totalPages={totalPages}
        totalUsers={totalUsers}
        itemsPerPage={itemsPerPage}
        onPageChange={setPage}
        onEdit={handleEditUser}
        onDelete={handleDeleteUser}
        onViewBlogs={handleViewBlogs}
      />

      <UserModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingUser(null);
          setModalError(null);
        }}
        onSubmit={handleSubmit}
        user={editingUser}
        loading={modalLoading}
        error={modalError || undefined}
      />

      <ConfirmModal
        isOpen={showDeleteConfirm}
        onClose={() => {
          setShowDeleteConfirm(false);
          setUserToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Delete User"
        message={
          <span>
            Are you sure you want to delete{" "}
            <span className="font-semibold text-gray-900">
              {userToDelete?.name}
            </span>
            ? This action cannot be undone.
          </span>
        }
        confirmText="Delete"
        loading={modalLoading}
      />
    </div>
  );
}