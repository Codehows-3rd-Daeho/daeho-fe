export type PaginationProps = {
  page: number; // 현재 페이지
  size: number; // 한 페이지당 row 개수
  totalCount: number; // 전체 row 개수
  onPageChange: (page: number) => void;
};
