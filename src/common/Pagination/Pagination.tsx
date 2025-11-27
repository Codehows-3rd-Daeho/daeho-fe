import { Box, Pagination } from "@mui/material";
import type { PaginationProps } from "./type";

export const CommonPagination = ({
  page,
  totalCount,
  onPageChange,
}: Omit<PaginationProps, "size" | "onSizeChange">) => {
  const totalPages = Math.max(1, Math.ceil(totalCount / 10)); // size 고정, 예: 10

  const handlePageChange = (_: unknown, newPage: number) => {
    if (newPage > totalPages) return;
    onPageChange(newPage);
  };

  return (
    <Box display="flex" justifyContent="center" mt={3}>
      <Pagination
        count={totalPages}
        page={page > totalPages ? totalPages : page}
        onChange={handlePageChange}
        variant="outlined"
        shape="rounded"
        color="primary"
        sx={{
          "& .MuiPaginationItem-root:focus": { outline: "none" },
        }}
      />
    </Box>
  );
};
// 추가할때 페이지에 넣기
//   const [page, setPage] = useState(1);
//   const [data, setData] = useState<[]>([]);
//   const [totalCount, setTotalCount] = useState(0);

// useEffect(() => {
//   getIssueList(page, 10).then((data) => { // 수정
//     setData(data.content); // 데이터
//     setTotalCount(data.totalElements); // 전체 개수
//   });
// }, [page]);

// return 내용
//     <CommonPagination
//         page={page}
//         totalCount={totalCount}
//         onPageChange={setPage}
//       />
