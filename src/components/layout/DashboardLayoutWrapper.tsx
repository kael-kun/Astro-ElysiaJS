import { DashboardLayout } from "./DashboardLayout";
import { AppProvider } from "src/providers";

interface DashboardLayoutWrapperProps {
  children: React.ReactNode;
  title?: string;
  showHeader?: boolean;
  sidebarCollapsed?: boolean;
}
export function DashboardLayoutWrapper(props: DashboardLayoutWrapperProps) {
  return (
    <AppProvider>
      <DashboardLayout {...props} />
    </AppProvider>
  );
}
