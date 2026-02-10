import { Sidebar } from "./Sidebar";
import { ContentDashboard } from "./ContentDashboard";

export function Dashboard() {
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 ml-64">
        <ContentDashboard />
      </div>
    </div>
  );
}
