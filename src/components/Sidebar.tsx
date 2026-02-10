import { LayoutDashboard, FileText, Users } from "lucide-react";

export function Sidebar() {
  const menuItems = [
    { name: "Dashboard", icon: LayoutDashboard, active: true, href: "/dashboard" },
    { name: "Blog", icon: FileText, href: "/dashboard/blog" },
    { name: "Users", icon: Users, href: "/dashboard/users" },
  ];

  return (
    <div className="fixed left-0 top-0 h-screen w-64 bg-gray-900 border-r border-gray-800 flex flex-col">
      {/* Logo/Header */}
      <div className="p-5 border-b border-gray-800">
        <div className="flex items-center space-x-2.5">
          <div className="w-7 h-7 bg-red-500 rounded flex items-center justify-center">
            <span className="text-white font-bold text-sm">C</span>
          </div>
          <span className="text-lg font-semibold text-white tracking-tight">CMS Dashboard</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="mt-6 px-3 flex-1">
        <ul className="space-y-0.5">
          {menuItems.map((item) => {
            const Icon = item.icon;

            return (
              <li key={item.name}>
                <a
                  href={item.href}
                  className={`flex items-center w-full py-2.5 px-3 rounded transition-colors ${
                    item.active
                      ? "bg-red-900/30 text-white border-l-2 border-red-500 font-medium"
                      : "text-gray-400 hover:bg-gray-800 hover:text-gray-200"
                  }`}
                >
                  <Icon className="w-5 h-5 mr-3" />
                  <span>{item.name}</span>
                </a>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-gray-800 mt-auto">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-full bg-red-500 flex items-center justify-center">
            <span className="text-white font-medium">A</span>
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-medium text-white truncate">Alex Morgan</p>
            <p className="text-xs text-gray-400 truncate">Administrator</p>
          </div>
        </div>
      </div>
    </div>
  );
}
