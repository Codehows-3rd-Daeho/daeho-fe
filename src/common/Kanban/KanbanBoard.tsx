import { useState } from "react";
import KanbanColumn from "./KanbanColumn";
import type { KanbanBoardProps } from "./type";

export function KanbanBoard({
  columns,
  issues,
  onClickIssue,
}: KanbanBoardProps) {
  // 각 컬럼의 보여주는 개수 초기값 설정 (5개씩)
  const initialVisibleCount = columns.reduce((acc, col) => {
    acc[col.key] = 5;
    return acc;
  }, {} as Record<string, number>);

  const [visibleCount, setVisibleCount] = useState(initialVisibleCount);

  const handleLoadMore = (key: string) => {
    setVisibleCount((prev) => ({
      ...prev,
      [key]: prev[key] + 5, // 5개씩 증가
    }));
  };

  return (
    <div className="h-full flex flex-col pb-6 pt-6">
      <div className="mx-auto w-full flex flex-col">
        <div className="flex flex-1 gap-8">
          {columns.map((col) => {
            const fullList = issues[col.key] || [];
            const sliced = fullList.slice(0, visibleCount[col.key]);
            const hasMore = fullList.length > visibleCount[col.key];

            return (
              <div key={col.key} className="flex-1 min-w-[300px]">
                <KanbanColumn
                  title={col.title}
                  issues={sliced}
                  hasMore={hasMore}
                  onLoadMore={() => handleLoadMore(col.key)}
                  onClickIssue={onClickIssue}
                  isDoneColumn={col.key === "done"}
                />
              </div>
            );
          })}
        </div>

        {/* 하단 설명 툴팁 박스 */}
        <div className="mt-4 p-2 text-center text-xs text-gray-600 bg-gray-200 rounded-lg max-w-lg mx-auto">
          최근등록 기준으로 표기됩니다
        </div>
      </div>
    </div>
  );
}

export default KanbanBoard;
