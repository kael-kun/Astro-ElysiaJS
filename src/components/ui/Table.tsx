import React, { useState, useMemo } from "react";
import { Button } from "./Button";

export interface Column<T> {
  key: keyof T | string;
  label: string;
  render?: (value: any, item: T, index: number) => React.ReactNode;
  sortable?: boolean;
  width?: string;
  align?: "left" | "center" | "right";
}

export interface TableProps<T> {
  data: T[];
  columns: Column<T>[];
  loading?: boolean;
  error?: string | null;
  onRowClick?: (item: T, index: number) => void;
  emptyState?: React.ReactNode;
  className?: string;
  rowClassName?: (item: T, index: number) => string;
  keyField?: keyof T;
}

export function Table<T extends Record<string, any>>({
  data,
  columns,
  loading = false,
  error = null,
  onRowClick,
  emptyState,
  className = "",
  rowClassName,
  keyField = "id",
}: TableProps<T>) {
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: "asc" | "desc" } | null>(null);

  const handleSort = (column: Column<T>) => {
    if (!column.sortable) return;

    setSortConfig((prev) => {
      if (prev?.key === column.key) {
        return prev.direction === "asc"
          ? { key: column.key, direction: "desc" }
          : null;
      }
      return { key: String(column.key), direction: "asc" };
    });
  };

  const sortedData = useMemo(() => {
    if (!sortConfig) return data;

    return [...data].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      if (aValue == null || bValue == null) return 0;
      if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });
  }, [data, sortConfig]);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="animate-pulse">
          <div className="h-12 bg-gray-200 rounded-t-lg"></div>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-100 border-b border-gray-200"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow overflow-hidden p-12 text-center">
        <div className="text-red-500 text-lg">{error}</div>
      </div>
    );
  }

  if (data.length === 0) {
    if (emptyState) {
      return <div className="bg-white rounded-lg shadow overflow-hidden">{emptyState}</div>;
    }

    return (
      <div className="bg-white rounded-lg shadow overflow-hidden p-12 text-center">
        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">No data</h3>
        <p className="mt-1 text-sm text-gray-500">No items to display</p>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow overflow-hidden ${className}`}>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column) => (
                <th
                  key={String(column.key)}
                  className={`px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider ${
                    column.align === "center" ? "text-center" : column.align === "right" ? "text-right" : "text-left"
                  } ${column.sortable ? "cursor-pointer hover:bg-gray-100" : ""}`}
                  style={{ width: column.width }}
                  onClick={column.sortable ? () => handleSort(column) : undefined}
                >
                  <div className="flex items-center space-x-1">
                    <span>{column.label}</span>
                    {column.sortable && (
                      <span className={`w-4 h-4 ${sortConfig?.key === column.key ? "text-red-600" : "text-gray-400"}`}>
                        {sortConfig?.key === column.key ? (
                          sortConfig.direction === "asc" ? (
                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                            </svg>
                          ) : (
                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          )
                        ) : (
                          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                          </svg>
                        )}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedData.map((item, index) => (
              <tr
                key={String(item[keyField])}
                className={`hover:bg-gray-50 transition-colors duration-150 ${
                  onRowClick ? "cursor-pointer" : ""
                } ${rowClassName ? rowClassName(item, index) : ""}`}
                onClick={() => onRowClick?.(item, index)}
              >
                {columns.map((column) => {
                  const value = item[column.key];
                  const alignClass =
                    column.align === "center" ? "text-center" : column.align === "right" ? "text-right" : "text-left";

                  return (
                    <td key={String(column.key)} className={`px-6 py-4 whitespace-nowrap text-sm ${alignClass}`}>
                      {column.render ? column.render(value, item, index) : value}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Action buttons component for tables
export interface TableActionsProps<T> {
  item: T;
  onView?: (item: T) => void;
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;
  actions?: Array<{
    label: string;
    icon: React.ReactNode;
    onClick: (item: T) => void;
    variant?: "primary" | "secondary" | "danger";
  }>;
}

export function TableActions<T>({ item, onView, onEdit, onDelete, actions = [] }: TableActionsProps<T>) {
  const allActions = [
    ...(onView
      ? [
          {
            label: "View",
            icon: (
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
            ),
            onClick: () => onView?.(item),
            variant: "secondary" as const,
          },
        ]
      : []),
    ...(onEdit
      ? [
          {
            label: "Edit",
            icon: (
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
            ),
            onClick: () => onEdit?.(item),
            variant: "secondary" as const,
          },
        ]
      : []),
    ...(onDelete
      ? [
          {
            label: "Delete",
            icon: (
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            ),
            onClick: () => onDelete?.(item),
            variant: "danger" as const,
          },
        ]
      : []),
    ...actions,
  ];

  return (
    <div className="flex justify-start space-x-2">
      {allActions.map((action, index) => (
        <Button
          key={index}
          variant="ghost"
          size="sm"
          onClick={() => action.onClick(item)}
          className="text-gray-600 hover:text-gray-900"
          title={action.label}
        >
          {action.icon}
        </Button>
      ))}
    </div>
  );
}
