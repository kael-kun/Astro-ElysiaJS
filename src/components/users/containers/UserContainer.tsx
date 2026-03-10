import { DashboardLayoutWrapper } from "src/components/layout/DashboardLayoutWrapper";
import { UsersManagement } from "src/components/users/components/UsersManagement";

export function UsersContainer() {
  return (
    <DashboardLayoutWrapper title="Users">
      <UsersManagement />
    </DashboardLayoutWrapper>
  );
}
