import React from "react";
import { StatsCard } from "src";
import type { User } from "src/components/users/types/user";

export interface UserStatsProps {
  users: User[];
  totalUsers: number;
  loading?: boolean;
}

export const UserStats: React.FC<UserStatsProps> = ({ users, totalUsers, loading = false }) => {
  const adminCount = users.filter((u: User) => u.role === "admin").length;
  const clientCount = users.filter((u: User) => u.role === "client").length;

  const userIcon = (
    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
      />
    </svg>
  );

  const adminIcon = (
    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
      />
    </svg>
  );

  const clientIcon = (
    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
      />
    </svg>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
      <StatsCard
        title="Total Users"
        value={loading ? "..." : totalUsers}
        icon={userIcon}
        iconBg="bg-red-100"
        iconColor="text-red-600"
      />

      <StatsCard
        title="Admins"
        value={loading ? "..." : adminCount}
        icon={adminIcon}
        iconBg="bg-blue-100"
        iconColor="text-blue-600"
      />

      <StatsCard
        title="Clients"
        value={loading ? "..." : clientCount}
        icon={clientIcon}
        iconBg="bg-green-100"
        iconColor="text-green-600"
      />
    </div>
  );
};
