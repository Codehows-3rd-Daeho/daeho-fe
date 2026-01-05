import { Box } from "@mui/material";
import { useLayoutEffect, useRef, useState, type ReactNode } from "react";

// container width 전달
// 사이드 바 펼쳤을 때 화면 길이 오류로 인한 diplay :  none 적용 안됨 해결
type PageHeaderProps = {
  children: (width: number) => ReactNode;
};

export const PageHeader = ({ children }: PageHeaderProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);

  useLayoutEffect(() => {
    if (!ref.current) return;
    const observer = new ResizeObserver(([entry]) => {
      setWidth(entry.contentRect.width);
    });
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <Box
      ref={ref}
      display="flex"
      justifyContent="space-between"
      alignItems="flex-end"
      mb={2}
      gap={2}
    >
      {children(width)}
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
