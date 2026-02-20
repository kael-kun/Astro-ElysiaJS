import { DashboardLayoutWrapper } from "src/components/layout/DashboardLayoutWrapper";
import { BlogEditContent } from "src/components/blog/components/BlogEditContent";

export function BlogEditContainer({ blogId }: { blogId: string }) {
  return (
    <DashboardLayoutWrapper title="Edit Blog">
      <BlogEditContent blogId={blogId || ""} />
    </DashboardLayoutWrapper>
  );
}
