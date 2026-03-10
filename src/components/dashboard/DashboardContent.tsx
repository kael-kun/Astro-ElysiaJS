import { useState, useEffect } from "react";
import {
  FileText,
  Users as UsersIcon,
  TrendingUp,
  Eye,
  Plus,
  FolderOpen,
  Clock,
  User,
  FileEdit,
  Trash2,
  CheckCircle,
} from "lucide-react";
import { Card, StatsCard, Pagination } from "../ui";
import { useAuth } from "src/providers/AuthProvider";
import apiClient from "src/services/apiClient";

interface DashboardStats {
  totalUsers?: number;
  totalBlogs: number;
  totalProjects: number;
  totalViews: number;
  myBlogs?: number;
  myProjects?: number;
  myViews?: number;
  myPublishedBlogs?: number;
}

interface DashboardLog {
  id: string;
  entity_type: "blog" | "project" | "user";
  entity_id: string;
  entity_title: string | null;
  action: string;
  details: string | null;
  user_name: string | null;
  created_at: string;
}

export function DashboardContent() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [logs, setLogs] = useState<DashboardLog[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(false);
  const [logsLoading, setLogsLoading] = useState(false);
  const [logsPage, setLogsPage] = useState(1);
  const [logsTotal, setLogsTotal] = useState(0);
  const [logsTotalPages, setLogsTotalPages] = useState(0);

  const isAdmin = user?.role === "admin";

  useEffect(() => {
    const fetchStats = async () => {
      setStatsLoading(true);
      try {
        const statsRes = await apiClient.get<DashboardStats>("/api/stats");
        setStats(statsRes.data);
      } catch (err) {
        console.error("Failed to fetch stats:", err);
      } finally {
        setStatsLoading(false);
      }
    };
    fetchStats();
  }, []);

  useEffect(() => {
    const fetchLogs = async () => {
      setLogsLoading(true);
      try {
        const logsRes = await apiClient.get<{ logs: DashboardLog[]; total: number; page: number; totalPages: number }>(
          `/api/logs?limit=5&page=${logsPage}`,
        );
        setLogs(logsRes.data.logs || []);
        setLogsTotal(logsRes.data.total || 0);
        setLogsTotalPages(logsRes.data.totalPages || 0);
      } catch (err) {
        console.error("Failed to fetch logs:", err);
      } finally {
        setLogsLoading(false);
        setInitialLoading(false);
      }
    };
    fetchLogs();
  }, [logsPage]);

  const formatDate = (dateString: string) => {
    if (!dateString) return "";

    let date: Date;
    if (dateString.includes(" ")) {
      date = new Date(dateString.replace(" ", "T"));
    } else {
      date = new Date(dateString);
    }

    if (isNaN(date.getTime())) return dateString;

    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
    if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days} days ago`;
    return date.toLocaleDateString();
  };

  const getActionBadge = (action: string) => {
    const badges: Record<string, { bg: string; text: string; label: string }> = {
      created: { bg: "bg-green-100", text: "text-green-800", label: "Created" },
      updated: { bg: "bg-blue-100", text: "text-blue-800", label: "Updated" },
      published: { bg: "bg-purple-100", text: "text-purple-800", label: "Published" },
      deleted: { bg: "bg-red-100", text: "text-red-800", label: "Deleted" },
    };
    const badge = badges[action] || { bg: "bg-gray-100", text: "text-gray-800", label: action };
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${badge.bg} ${badge.text}`}>
        {badge.label}
      </span>
    );
  };

  const statsData = isAdmin
    ? [
        {
          title: "Total Blogs",
          value: stats?.totalBlogs?.toLocaleString() || "0",
          icon: <FileText className="w-6 h-6" />,
          iconBg: "bg-blue-500",
        },
        {
          title: "Total Users",
          value: stats?.totalUsers?.toLocaleString() || "0",
          icon: <UsersIcon className="w-6 h-6" />,
          iconBg: "bg-green-500",
        },
        {
          title: "Total Projects",
          value: stats?.totalProjects?.toLocaleString() || "0",
          icon: <FolderOpen className="w-6 h-6" />,
          iconBg: "bg-purple-500",
        },
        {
          title: "Total Views",
          value: stats?.totalViews?.toLocaleString() || "0",
          icon: <Eye className="w-6 h-6" />,
          iconBg: "bg-orange-500",
        },
      ]
    : [
        {
          title: "My Blogs",
          value: stats?.myBlogs?.toLocaleString() || "0",
          icon: <FileText className="w-6 h-6" />,
          iconBg: "bg-blue-500",
        },
        {
          title: "My Projects",
          value: stats?.myProjects?.toLocaleString() || "0",
          icon: <FolderOpen className="w-6 h-6" />,
          iconBg: "bg-purple-500",
        },
        {
          title: "My Views",
          value: stats?.myViews?.toLocaleString() || "0",
          icon: <Eye className="w-6 h-6" />,
          iconBg: "bg-orange-500",
        },
        {
          title: "Published",
          value: stats?.myPublishedBlogs?.toLocaleString() || "0",
          icon: <TrendingUp className="w-6 h-6" />,
          iconBg: "bg-green-500",
        },
      ];

  const quickActions = [
    {
      title: "Create New Blog",
      description: "Start writing a new blog post",
      icon: Plus,
      href: "/dashboard/blogs",
      color: "bg-red-500 hover:bg-red-600",
    },
    ...(isAdmin
      ? [
          {
            title: "Manage Users",
            description: "View and manage user accounts",
            icon: UsersIcon,
            href: "/dashboard/users",
            color: "bg-blue-500 hover:bg-blue-600",
          },
        ]
      : []),
    {
      title: "View Projects",
      description: "View your projects",
      icon: FolderOpen,
      href: "/dashboard/projects",
      color: "bg-purple-500 hover:bg-purple-600",
    },
  ];

  if (initialLoading) {
    return (
      <div className="p-6 bg-gray-50 min-h-full">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-full">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold text-gray-900">Welcome, {user?.name || "User"}!</h1>
            <span
              className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                isAdmin ? "bg-purple-100 text-purple-800" : "bg-blue-100 text-blue-800"
              }`}
            >
              {isAdmin ? "Admin" : "Client"}
            </span>
          </div>
          <p className="text-gray-600">Here&apos;s what&apos;s happening with your content today.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statsLoading ? (
            <>
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl p-6 shadow-sm">
                  <div className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-24 mb-4"></div>
                    <div className="h-8 bg-gray-200 rounded w-16"></div>
                  </div>
                </div>
              ))}
            </>
          ) : (
            statsData.map((stat, index) => (
              <StatsCard
                key={index}
                title={stat.title}
                value={stat.value}
                icon={stat.icon}
                iconBg={stat.iconBg}
                iconColor="text-white"
              />
            ))
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h2>
            {logsLoading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-start space-x-3 pb-4 border-b border-gray-100 last:border-0">
                    <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : logs.length > 0 ? (
              <>
                <div className="space-y-4">
                  {logs.map((log) => {
                    const getEntityIcon = () => {
                      switch (log.entity_type) {
                        case "blog":
                          return <FileText className="w-4 h-4 text-blue-600" />;
                        case "project":
                          return <FolderOpen className="w-4 h-4 text-purple-600" />;
                        case "user":
                          return <User className="w-4 h-4 text-green-600" />;
                        default:
                          return <FileText className="w-4 h-4 text-gray-600" />;
                      }
                    };
                    const getEntityLabel = () => {
                      switch (log.entity_type) {
                        case "blog":
                          return "blog";
                        case "project":
                          return "project";
                        case "user":
                          return "user";
                        default:
                          return "item";
                      }
                    };
                    return (
                      <div
                        key={log.id}
                        className="flex items-start justify-between pb-4 border-b border-gray-100 last:border-0 last:pb-0"
                      >
                        <div className="flex items-start space-x-3">
                          <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                            {getEntityIcon()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-gray-900">
                              <span className="font-medium">{log.user_name || "Unknown"}</span>{" "}
                              {log.action === "created"
                                ? "created"
                                : log.action === "updated"
                                  ? "updated"
                                  : log.action === "published"
                                    ? "published"
                                    : log.action === "deleted"
                                      ? "deleted"
                                      : log.action}{" "}
                              <span className="font-medium text-blue-600">
                                {log.entity_title || `Unknown ${getEntityLabel()}`}
                              </span>
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {log.entity_type === "blog" ? "Blog" : log.entity_type === "project" ? "Project" : "User"}{" "}
                              • {formatDate(log.created_at)}
                            </p>
                          </div>
                        </div>
                        {getActionBadge(log.action)}
                      </div>
                    );
                  })}
                </div>
                <Pagination
                  currentPage={logsPage}
                  totalPages={logsTotalPages}
                  totalItems={logsTotal}
                  itemsPerPage={5}
                  onPageChange={setLogsPage}
                  className="mt-4"
                />
              </>
            ) : (
              <p className="text-gray-500 text-sm">No activity yet.</p>
            )}
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="space-y-3">
              {quickActions.map((action, index) => {
                const Icon = action.icon;
                return (
                  <a
                    key={index}
                    href={action.href}
                    className={`block p-4 rounded-lg text-white ${action.color} transition-colors group`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center group-hover:bg-white/30 transition-colors">
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-medium">{action.title}</h3>
                        <p className="text-sm text-white/80">{action.description}</p>
                      </div>
                    </div>
                  </a>
                );
              })}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
