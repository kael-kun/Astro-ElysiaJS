import React, { useState, useEffect, useRef } from "react";
import { LayoutDashboard, FileText, Users, X, LogOut, FolderOpen } from "lucide-react";
import { Button } from "./ui/Button";
import { useAuth } from "src/providers/AuthProvider";

interface SidebarProps {
  collapsed?: boolean;
  onCloseMobile?: () => void;
}

export function Sidebar({ collapsed = false, onCloseMobile }: SidebarProps) {
  const [currentPath, setCurrentPath] = useState("/dashboard");
  const pathRef = React.useRef("/dashboard");
  const [showUserMenu, setShowUserMenu] = useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);
  const { user, logout } = useAuth();

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Set initial path
    const initialPath = window.location.pathname;
    setCurrentPath(initialPath);
    pathRef.current = initialPath;

    // Listen for browser back/forward
    const handleLocationChange = () => {
      const newPath = window.location.pathname;
      setCurrentPath(newPath);
      pathRef.current = newPath;
    };

    window.addEventListener("popstate", handleLocationChange);

    // Use MutationObserver to detect SPA navigation (instant, no polling)
    const observer = new MutationObserver(() => {
      const newPath = window.location.pathname;
      if (newPath !== pathRef.current) {
        setCurrentPath(newPath);
        pathRef.current = newPath;
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => {
      window.removeEventListener("popstate", handleLocationChange);
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    window.location.href = "/auth/login";
  };

  const menuItems = [
    { name: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
    { name: "Projects", icon: FolderOpen, href: "/dashboard/projects" },
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
            <Button
              variant="ghost"
              size="sm"
              onClick={onCloseMobile}
              className="md:hidden text-gray-400 hover:text-white"
              aria-label="Close sidebar"
            >
              <X className="w-5 h-5" />
            </Button>
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
      <div className="p-4 border-t border-gray-800 mt-auto" ref={menuRef}>
        <div className={`relative ${collapsed ? "justify-center" : ""}`}>
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className={`flex items-center w-full ${collapsed ? "justify-center" : "space-x-3"} hover:bg-gray-800 p-2 rounded-lg transition-colors`}
          >
            <div className="w-9 h-9 rounded-full bg-red-500 flex items-center justify-center flex-shrink-0">
              <span className="text-white font-medium">
                {user?.name?.charAt(0).toUpperCase() || "G"}
              </span>
            </div>
            {!collapsed && (
              <div className="overflow-hidden flex-1 text-left">
                <p className="text-sm font-medium text-white truncate">{user?.name || "Guest"}</p>
                <p className="text-xs text-gray-400 truncate">
                  {user?.role === "admin" ? "Administrator" : "Client"}
                </p>
              </div>
            )}
          </button>

          {/* Dropdown Menu */}
          {showUserMenu && !collapsed && (
            <div className="absolute bottom-full left-0 right-0 mb-2 bg-gray-800 rounded-lg shadow-lg border border-gray-700 overflow-hidden">
              <button
                onClick={handleLogout}
                className="flex items-center w-full px-4 py-3 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
              >
                <LogOut className="w-4 h-4 mr-3" />
                Sign Out
              </button>
            </div>
          )}

          {/* Collapsed state logout button */}
          {showUserMenu && collapsed && (
            <div className="absolute bottom-full left-full ml-2 mb-2 bg-gray-800 rounded-lg shadow-lg border border-gray-700 overflow-hidden">
              <button
                onClick={handleLogout}
                className="flex items-center px-4 py-3 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors whitespace-nowrap"
              >
                <LogOut className="w-4 h-4 mr-3" />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
