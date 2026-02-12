import { useState, useEffect } from "react";
import { LayoutDashboard, FileText, Users, X } from "lucide-react";

interface SidebarProps {
  collapsed?: boolean;
  onCloseMobile?: () => void;
}

export function Sidebar({ collapsed = false, onCloseMobile }: SidebarProps) {
  const [currentPath, setCurrentPath] = useState("/dashboard");

  useEffect(() => {
    // Get current path from window location
    if (typeof window !== "undefined") {
      setCurrentPath(window.location.pathname);
    }
  }, []);

  const menuItems = [
    { name: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
    { name: "Blog", icon: FileText, href: "/dashboard/blog" },
    { name: "Users", icon: Users, href: "/dashboard/users" },
  ];

  const isActive = (href: string) => {
    return currentPath === href || (href !== "/dashboard" && currentPath.startsWith(href));
  };

  return (
    <div
      className="fixed left-0 top-0 h-screen bg-gray-900 border-r border-gray-800 flex flex-col transition-all duration-300 z-50"
      style={{ width: collapsed ? "4rem" : "16rem" }}
    >
      {/* Logo/Header */}
      <div className="p-4 border-b border-gray-800">
        <div className="flex items-center justify-between">
          <div className={`flex items-center ${collapsed ? "justify-center" : "space-x-2.5"}`}>
            <div className="w-7 h-7 bg-red-500 rounded flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-sm">C</span>
            </div>
            {!collapsed && <span className="text-lg font-semibold text-white tracking-tight">CMS Dashboard</span>}
          </div>
          {/* Mobile close button */}
          {onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="md:hidden p-1 rounded text-gray-400 hover:text-white hover:bg-gray-800"
              aria-label="Close sidebar"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="mt-6 px-3 flex-1">
        <ul className="space-y-0.5">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);

            return (
              <li key={item.name}>
                <a
                  href={item.href}
                  className={`flex items-center w-full py-2.5 px-3 rounded transition-colors group ${
                    active
                      ? "bg-red-900/30 text-white border-l-2 border-red-500 font-medium"
                      : "text-gray-400 hover:bg-gray-800 hover:text-gray-200"
                  }`}
                >
                  <Icon className={`w-5 h-5 ${collapsed ? "mx-auto" : "mr-3"} flex-shrink-0`} />
                  {!collapsed && <span>{item.name}</span>}
                  {collapsed && (
                    <div className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                      {item.name}
                    </div>
                  )}
                </a>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-gray-800 mt-auto">
        <div className={`flex items-center ${collapsed ? "justify-center" : "space-x-3"}`}>
          <div className="w-9 h-9 rounded-full bg-red-500 flex items-center justify-center flex-shrink-0">
            <span className="text-white font-medium">A</span>
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <p className="text-sm font-medium text-white truncate">Alex Morgan</p>
              <p className="text-xs text-gray-400 truncate">Administrator</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
