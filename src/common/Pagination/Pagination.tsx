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

//     useEffect(() => {
//       fetch(`/api/meeting?page=${page}&size=10`) 주소 수정
//         .then((res) => res.json())
//         .then((data) => {
//           setData(data.content); 타입 명칭에 따라 수정필요하면 수정하기
//           setTotalCount(data.totalElements);
//         });
//     }, [page]);

// return 내용
//     <CommonPagination
//         page={page}
//         totalCount={totalCount}
//         onPageChange={setPage}
//       />
