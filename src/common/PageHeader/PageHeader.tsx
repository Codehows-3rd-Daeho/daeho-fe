import { Box } from "@mui/material";
import { type ReactNode } from "react";

export const PageHeader = ({ children }: { children: ReactNode }) => {
  return (
    <Box
      display="flex"
      justifyContent="space-between"
      alignItems="center"
      mb={2}
      gap={2}
    >
      {children}
    </Box>
  );
};

// PageHaeder에서 사용하고 싶은 기능들만 넣어서 수정 필요없는건 안넣으면 화면에 안나옴

{
  /* <PageHeader>
  //토글
  <Toggle
    options={[
      { label: "리스트", value: "list", path: "/issue/list" },
      { label: "칸반", value: "kanban", path: "/issue/kanban" },
    ]}
  />

  //등록
  <AddButton onClick={() => navigate("/issue/create")} />
</PageHeader>; */
}
