import { Sidebar } from "./Sidebar";
import { ContentBlog } from "./ContentBlog";

export function BlogUi() {
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 ml-64">
        <ContentBlog />
      </div>
    </div>
  );
}
