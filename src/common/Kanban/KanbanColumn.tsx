import KanbanCard from "./KanbanCard";
import type { KanbanColumnProps } from "./type";

export default function KanbanColumn({
  title,
  issues,
  hasMore,
  onLoadMore,
  onClickIssue,
}: KanbanColumnProps) {
  const handleClick = () => {
    // 로딩할 데이터가 없는데 버튼 클릭하면 무시
    if (issues.length === 0) return;

    // hasMore가 true일 때만 실행됨
    onLoadMore();
  };

  return (
    <div className="bg-gray-50 rounded-xl p-4 shadow-sm flex flex-col border border-gray-200 self-start flex-1 min-w-[200px]">
      {/* 타이틀 */}
      <h2 className="font-bold text-lg mb-3">{title}</h2>

      {/* 카드 목록 */}
      <div className="flex flex-col gap-3 min-h-[128px]">
        {issues.map((issue) => (
          <KanbanCard
            key={issue.id}
            issue={issue}
            onClick={() => onClickIssue?.(issue)}
          />
        ))}
      </div>

      {/* 더보기 버튼 — 표시 여부는 hasMore로만 판단 */}
      {hasMore && (
        <button
          className="mt-4 text-gray-500 text-sm hover:underline self-start"
          onClick={handleClick}
        >
          + 더보기
        </button>
      )}
    </div>
  );
}
