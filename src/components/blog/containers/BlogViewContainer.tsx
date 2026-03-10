import { DashboardLayoutWrapper } from "src/components/layout/DashboardLayoutWrapper";
import { BlogViewContent } from "./BlogViewContent";

export function BlogViewContainer({ blogId }: { blogId: string }) {
  return (
    <DashboardLayoutWrapper title="Blog Preview">
      <BlogViewContent blogId={blogId} />
    </DashboardLayoutWrapper>
  );
}
