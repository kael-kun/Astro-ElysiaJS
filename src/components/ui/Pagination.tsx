import React, { useMemo } from "react";
import { Button } from "./Button";

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems?: number;
  itemsPerPage?: number;
  showInfo?: boolean;
  maxVisible?: number;
  className?: string;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  itemsPerPage = 10,
  showInfo = true,
  maxVisible = 5,
  className = "",
}) => {
  const safeTotalItems = Number(totalItems) || 0;
  const safeCurrentPage = Number(currentPage) || 1;
  const safeItemsPerPage = Number(itemsPerPage) || 10;
  const safeTotalPages = Number(totalPages) || 1;

  const startItem = safeTotalItems ? (safeCurrentPage - 1) * safeItemsPerPage + 1 : 0;
  const endItem = safeTotalItems ? Math.min(safeCurrentPage * safeItemsPerPage, safeTotalItems) : 0;

  const getPageNumbers = useMemo(() => {
    const pages: (number | string)[] = [];

    if (safeTotalPages <= maxVisible) {
      for (let i = 1; i <= safeTotalPages; i++) {
        pages.push(i);
      }
    } else {
      if (safeCurrentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push("...");
        pages.push(safeTotalPages);
      } else if (safeCurrentPage >= safeTotalPages - 2) {
        pages.push(1);
        pages.push("...");
        for (let i = safeTotalPages - 3; i <= safeTotalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push("...");
        for (let i = safeCurrentPage - 1; i <= safeCurrentPage + 1; i++) {
          pages.push(i);
        }
        pages.push("...");
        pages.push(safeTotalPages);
      }
    }

    return pages;
  }, [safeCurrentPage, safeTotalPages, maxVisible]);

  const handlePrevious = () => {
    if (safeCurrentPage > 1) {
      onPageChange(safeCurrentPage - 1);
    }
  };

  const handleNext = () => {
    if (safeCurrentPage < safeTotalPages) {
      onPageChange(safeCurrentPage + 1);
    }
  };

  if (safeTotalPages <= 1) {
    return null;
  }

  return (
    <div className={`flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200 ${className}`}>
      {showInfo && totalItems ? (
        <div className="text-sm text-gray-700">
          Showing <span className="font-medium">{startItem}</span> to <span className="font-medium">{endItem}</span> of{" "}
          <span className="font-medium">{totalItems}</span> results
        </div>
      ) : (
        <div />
      )}

      <div className="flex items-center space-x-2">
        <Button variant="ghost" size="sm" onClick={handlePrevious} disabled={safeCurrentPage === 1}>
          Previous
        </Button>

        <div className="flex items-center space-x-1">
          {getPageNumbers.map((page, index) =>
            typeof page === "string" ? (
              <span key={`ellipsis-${index}`} className="px-3 py-2 text-sm font-medium text-gray-500">
                {page}
              </span>
            ) : (
              <Button
                key={page}
                variant={safeCurrentPage === page ? "primary" : "ghost"}
                size="sm"
                onClick={() => onPageChange(page)}
                className={`w-10 h-10 p-0 ${safeCurrentPage !== page ? "text-gray-700" : ""}`}
              >
                {page}
              </Button>
            ),
          )}
        </div>

        <Button variant="ghost" size="sm" onClick={handleNext} disabled={safeCurrentPage === safeTotalPages}>
          Next
        </Button>
      </div>
    </div>
  );
};
