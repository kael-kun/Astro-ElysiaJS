import React, { useState, useEffect } from "react";
import { Menu } from "lucide-react";
import { Sidebar } from "../Sidebar";
import { Card } from "../../index";
import { useAuth } from "src/providers/AuthProvider";

interface DashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
  showHeader?: boolean;
  sidebarCollapsed?: boolean;
}

export function DashboardLayout({
  children,
  title,
  showHeader = true,
  sidebarCollapsed = false,
}: DashboardLayoutProps) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(sidebarCollapsed);
  const [isMobile, setIsMobile] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setIsMobileSidebarOpen(false);
      }
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const toggleSidebar = () => {
    if (isMobile) {
      setIsMobileSidebarOpen(!isMobileSidebarOpen);
    } else {
      setIsSidebarCollapsed(!isSidebarCollapsed);
    }
  };

  const sidebarWidth = isMobile ? (isMobileSidebarOpen ? "block" : "hidden md:block") : "block";

  const contentMargin = isMobile ? "ml-0" : isSidebarCollapsed ? "ml-16" : "ml-64";

  return (
    <div className="flex h-screen bg-gray-50 relative">
      {/* Mobile overlay */}
      {isMobile && isMobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`${sidebarWidth} transition-all duration-300 ${isMobile && !isMobileSidebarOpen ? "-translate-x-full" : ""}`}
      >
        <Sidebar
          collapsed={isMobile ? false : isSidebarCollapsed}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
        />
      </div>

      {/* Main Content */}
      <div className={`flex-1 transition-all duration-300 ${contentMargin}`}>
        {/* Header */}
        {showHeader && (
          <Card
            shadow="none"
            rounded="none"
            className="border-b border-gray-200 px-6 py-4 flex items-center justify-between"
          >
            <div className="flex items-center space-x-4">
              <button
                onClick={toggleSidebar}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                aria-label="Toggle sidebar"
              >
                <Menu className="w-5 h-5" />
              </button>
              {title && <h1 className="text-xl font-semibold text-gray-900">{title}</h1>}
            </div>

            {/* User info for mobile */}
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center">
                <span className="text-white text-sm font-medium">
                  {user?.name?.charAt(0).toUpperCase() || "G"}
                </span>
              </div>
            </div>
          </Card>
        )}

        {/* Page Content */}
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
