import { FileText, Users, TrendingUp, Clock, Plus, Edit, Eye } from "lucide-react";
import { Card, StatsCard } from "../ui";
import { useAuth } from "src/providers/AuthProvider";
export function DashboardContent() {
  const { user } = useAuth();
  console.log("userrrrr here in dashboard", user);
  const stats = [
    {
      title: "Total Blogs",
      value: "24",
      change: "+12%",
      changeType: "positive" as const,
      icon: <FileText className="w-6 h-6" />,
      iconBg: "bg-blue-500",
    },
    {
      title: "Total Users",
      value: "1,429",
      change: "+23%",
      changeType: "positive" as const,
      icon: <Users className="w-6 h-6" />,
      iconBg: "bg-green-500",
    },
    {
      title: "Views Today",
      value: "3,847",
      change: "-5%",
      changeType: "negative" as const,
      icon: <Eye className="w-6 h-6" />,
      iconBg: "bg-purple-500",
    },
    {
      title: "Growth Rate",
      value: "18.2%",
      change: "+2.1%",
      changeType: "positive" as const,
      icon: <TrendingUp className="w-6 h-6" />,
      iconBg: "bg-orange-500",
    },
  ];

  const recentActivity = [
    {
      id: 1,
      action: "Published blog",
      title: "Getting Started with React Hooks",
      time: "2 hours ago",
      author: "Alex Morgan",
    },
    {
      id: 2,
      action: "Edited draft",
      title: "Understanding TypeScript Generics",
      time: "4 hours ago",
      author: "Alex Morgan",
    },
    {
      id: 3,
      action: "Created new draft",
      title: "Building Scalable APIs with Node.js",
      time: "1 day ago",
      author: "Alex Morgan",
    },
  ];

  const quickActions = [
    {
      title: "Create New Blog",
      description: "Start writing a new blog post",
      icon: Plus,
      href: "/dashboard/blog",
      color: "bg-red-500 hover:bg-red-600",
    },
    {
      title: "Manage Users",
      description: "View and manage user accounts",
      icon: Users,
      href: "/dashboard/users",
      color: "bg-blue-500 hover:bg-blue-600",
    },
    {
      title: "View Analytics",
      description: "Check your site performance",
      icon: TrendingUp,
      href: "/dashboard/analytics",
      color: "bg-green-500 hover:bg-green-600",
    },
    {
      title: "Recent Drafts",
      description: "Continue writing your drafts",
      icon: Edit,
      href: "/dashboard/drafts",
      color: "bg-purple-500 hover:bg-purple-600",
    },
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-full">
      <div className="max-w-7xl mx-auto">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome back, Alex!</h1>
          <p className="text-gray-600">Here's what's happening with your content today.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <StatsCard
              key={index}
              title={stat.title}
              value={stat.value}
              icon={stat.icon}
              iconBg={stat.iconBg}
              iconColor="text-white"
              trend={{
                value: stat.change,
                direction: stat.changeType === "positive" ? "up" : "down",
              }}
            />
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Activity */}
          <Card className="lg:col-span-2 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h2>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start space-x-3 pb-4 border-b border-gray-100 last:border-0 last:pb-0"
                >
                  <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Clock className="w-4 h-4 text-gray-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900">
                      <span className="font-medium">{activity.author}</span> {activity.action}{" "}
                      <span className="font-medium text-blue-600">{activity.title}</span>
                    </p>
                    <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Quick Actions */}
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
