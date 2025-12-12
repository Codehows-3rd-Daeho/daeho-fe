import type { IssueListItem } from "../../issue/type/type";

// D-Day 및 마감 임박 여부를 계산하는 함수
const calculateDDay = (endDate: string) => {
  const today = new Date();
  const end = new Date(endDate);

  // 날짜만 비교하여 D-Day 계산
  const diffTime = end.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  // 마감 임박: D-Day가 0이거나 1일 이하
  const isImminent = diffDays <= 1 && diffDays >= 0;

  return { dDay: diffDays, isImminent };
};

export default function KanbanCard({
  issue,
  onClick,
}: {
  issue: IssueListItem;
  onClick?: () => void;
}) {
  // D-Day 및 마감 임박 계산
  const { dDay, isImminent } = calculateDDay(issue.endDate);
  const dDayText = dDay >= 0 ? `D-${dDay}` : `D+${Math.abs(dDay)}`;

  // 부서(Department) 표시 처리 (최대 2개 표시, 3개 이상은 ...)
  const visibleDepartments = issue.departmentName.slice(0, 2);
  const hasMoreDepartments = issue.departmentName.length > 2;

  // 날짜 형식 변경 (25.10.01) - 필요한 경우 포맷팅 로직 추가
  const formatShortDate = (dateString: string) => {
    // issue.startDate와 issue.endDate가 "YYYY-MM-DD" 형태라고 가정하고 포맷합니다.
    try {
      const parts = dateString.split("-");
      if (parts.length === 3) {
        return `${parts[0].slice(2)}.${parts[1]}.${parts[2]}`;
      }
      return dateString; // 포맷 실패 시 원본 반환
    } catch {
      return dateString;
    }
  };

  const formattedStartDate = formatShortDate(issue.startDate);
  const formattedEndDate = formatShortDate(issue.endDate);

  return (
    <div
      onClick={onClick}
      // Tailwind CSS 클래스는 그대로 유지합니다.
      className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm
                hover:shadow-md transition-shadow cursor-pointer"
    >
      {/* 상단 섹션: D-Day, 마감임박, Category */}
      <div className="flex justify-between items-start mb-3">
        {/* 왼쪽 상단: D-Day & 마감 임박 */}
        <div className="flex items-center space-x-2">
          {/* D-Day */}
          <span
            // D-Day가 0일 이하일 경우 색상 변경 가능 (선택 사항)
            className={`text-sm font-medium px-2 py-0.5 rounded-full ${
              dDay <= 0
                ? "bg-red-100 text-red-600"
                : "bg-blue-100 text-blue-600"
            }`}
          >
            {dDayText}
          </span>

          {/* 마감 임박 (D-Day가 1일 이하인 경우) */}
          {isImminent && (
            <span className="text-xs px-2 py-1 rounded-full bg-red-200 text-red-800 font-medium">
              마감임박
            </span>
          )}
        </div>

        {/* 오른쪽 상단: Category (주제) */}
        <span className="text-xs px-2 py-1 rounded-full bg-purple-200 text-purple-800 font-medium">
          {issue.categoryName}
        </span>
      </div>

      {/* 중간 섹션: 이슈 제목 */}
      <h3 className="font-medium text-gray-900 mb-3">{issue.title}</h3>

      {/* 하단 섹션: Department, 날짜 범위, Host */}
      <div className="space-y-2">
        {/* Department (부서) */}
        <div className="flex flex-wrap items-center space-x-2">
          {visibleDepartments.map((dept, index) => (
            <span
              key={index}
              className="text-xs px-2 py-0.5 rounded-full bg-gray-200 text-gray-700 font-normal"
            >
              {dept}
            </span>
          ))}
          {hasMoreDepartments && (
            <span className="text-sm font-normal text-gray-500">...</span>
          )}
        </div>

        {/* 날짜 범위 & 주관자 */}
        <div className="flex justify-between items-center text-sm text-gray-500">
          {/* 왼쪽 하단: 날짜 범위 */}
          <span>
            {formattedStartDate} ~ {formattedEndDate}
          </span>

          {/* 오른쪽 하단: 주관자 이름 */}
          <span className="font-medium text-gray-600">
            주관자 {issue.hostName}
          </span>
        </div>
      </div>
    </div>
  );
}
