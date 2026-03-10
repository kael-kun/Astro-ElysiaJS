import { DashboardLayoutWrapper } from "../../layout/DashboardLayoutWrapper";
import { BlogListContent } from "./BlogListContent";

export function BlogListContainer() {
  return (
    <DashboardLayoutWrapper title="Blogs">
      <BlogListContent />
    </DashboardLayoutWrapper>
  );
}
