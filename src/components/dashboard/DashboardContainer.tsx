import { DashboardLayoutWrapper } from "../layout/DashboardLayoutWrapper";
import { DashboardContent } from "./DashboardContent";

export function DashboardContainer() {
  return (
    <DashboardLayoutWrapper title="Dashboard">
      <DashboardContent />
    </DashboardLayoutWrapper>
  );
}
