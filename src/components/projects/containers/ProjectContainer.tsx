import { DashboardLayoutWrapper } from "src/components/layout/DashboardLayoutWrapper";
import { ProjectsContent } from "./ProjectsContent";

export function ProjectContainer() {
  return (
    <DashboardLayoutWrapper title="Projects">
      <ProjectsContent />
    </DashboardLayoutWrapper>
  );
}
