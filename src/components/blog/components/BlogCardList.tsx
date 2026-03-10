import { BlogCard } from "./BlogCard";
import { LoadingSpinner } from "../../ui/LoadingSpinner";
import type { Blog } from "../hooks/useProjectBlogs";

interface BlogCardListProps {
  blogs: Blog[];
  loading?: boolean;
  onDelete?: (blog: Blog) => void;
  showOwner?: boolean;
}

export function BlogCardList({ blogs, loading, onDelete, showOwner }: BlogCardListProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (blogs.length === 0) {
    return (
      <div className="text-center py-12">
        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
        </svg>
        <h3 className="mt-4 text-lg font-medium text-gray-900">No blogs yet</h3>
        <p className="mt-2 text-sm text-gray-500">Get started by generating a new blog post.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {blogs.map((blog) => (
        <BlogCard key={blog.id} blog={blog} onDelete={onDelete} showOwner={showOwner} />
      ))}
    </div>
  );
}
