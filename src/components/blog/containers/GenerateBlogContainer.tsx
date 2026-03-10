import { DashboardLayoutWrapper } from "../../layout/DashboardLayoutWrapper";
import { GenerateBlogContent } from "./GenerateBlogContent";

export function GenerateBlogContainer() {
  return (
    <DashboardLayoutWrapper title="Generate Blog">
      <GenerateBlogContent />
    </DashboardLayoutWrapper>
  );
}
