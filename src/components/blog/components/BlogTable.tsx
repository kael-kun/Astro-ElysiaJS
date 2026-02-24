import { Table, Column } from "../../ui/Table";
import { Button } from "../../ui/Button";
import type { Blog } from "../hooks/useProjectBlogs";
import { formatDate } from "../../../utils/index";

interface BlogTableProps {
  blogs: Blog[];
  loading?: boolean;
  onDelete?: (blog: Blog) => void;
  showProject?: boolean;
  showOwner?: boolean;
}

export function BlogTable({ blogs, loading, onDelete, showProject, showOwner }: BlogTableProps) {
  const urlParams = new URLSearchParams(window.location.search);
  const projectId = urlParams.get("projectId");
  const handleView = (blog: Blog) => {
    window.location.href = `/dashboard/blogs/view/${blog.id}?projectId=${projectId}`;
  };

  const handleEdit = (blog: Blog) => {
    window.location.href = `/dashboard/blogs/edit/${blog.id}?projectId=${projectId}`;
  };

  const formatDateValue = (dateString: string) => {
    return formatDate(dateString, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const renderStatus = (status: string) => {
    const isPublished = status === "published";
    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          isPublished ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
        }`}
      >
        {isPublished ? "Published" : "Draft"}
      </span>
    );
  };

  const renderActions = (_value: unknown, blog: Blog, _index: number) => {
    return (
      <div className="flex items-center space-x-2">
        <Button variant="ghost" size="sm" onClick={() => handleView(blog)} title="View">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
            />
          </svg>
        </Button>
        <Button variant="ghost" size="sm" onClick={() => handleEdit(blog)} title="Edit">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
            />
          </svg>
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDelete?.(blog)}
          title="Delete"
          className="text-red-600 hover:text-red-700"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        </Button>
      </div>
    );
  };

  const columns: Column<Blog>[] = [
    ...(showProject
      ? [
          {
            key: "project_name",
            label: "Project",
            render: (value) => <span className="text-gray-900 font-medium">{value || "No Project"}</span>,
          } as Column<Blog>,
        ]
      : []),
    ...(showOwner
      ? [
          {
            key: "user_name",
            label: "Owner",
            render: (value) => <span className="text-gray-600">{value || "Unknown"}</span>,
          } as Column<Blog>,
        ]
      : []),
    {
      key: "title",
      label: "Title",
      render: (value) => <div className="max-w-xs truncate font-medium text-gray-900">{value || "Untitled Blog"}</div>,
    },
    {
      key: "status",
      label: "Status",
      render: (value) => renderStatus(value as string),
    },
    {
      key: "createdAt",
      label: "Created",
      sortable: true,
      render: (value) => formatDateValue(value as string),
    },
    {
      key: "actions",
      label: "Actions",
      align: "right",
      render: renderActions,
    },
  ];

  const emptyState = (
    <div className="p-12 text-center">
      <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        />
      </svg>
      <h3 className="mt-2 text-sm font-medium text-gray-900">No blogs yet</h3>
      <p className="mt-1 text-sm text-gray-500">Get started by creating a new blog</p>
    </div>
  );

  return <Table<Blog> data={blogs} columns={columns} loading={loading} emptyState={emptyState} keyField="id" />;
}
