import { Pagination as UIPagination } from "../ui/Pagination";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems: number;
  itemsPerPage: number;
}

export const Pagination: React.FC<PaginationProps> = (props) => {
  return (
    <UIPagination
      currentPage={props.currentPage}
      totalPages={props.totalPages}
      onPageChange={props.onPageChange}
      totalItems={props.totalItems}
      itemsPerPage={props.itemsPerPage}
    />
  );
};