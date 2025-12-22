import { useLocation, Link } from "react-router-dom";

export default function Breadcrumb() {
  const location = useLocation();
  // 현재의 URL 경로 -> 문자열
  const pathnames = location.pathname.split("/").filter((x) => x);

  const breadcrumbNameMap: Record<string, string> = {
    // dashboard: "대시보드",
    mypage: "마이페이지",
    issue: "이슈",
    list: "목록",
    kanban: "칸반 보드",
    meeting: "회의",
    create: "등록",
    update: "수정",
    schedule: "회의 일정표",
    mytask: "나의 업무",
    admin: "관리자",
    member: "회원 관리",
    log: "로그 조회",
    setting: "관리자 설정",
  };

  const validPaths = [
    //대시보드
    // "/dashboard",

    // 이슈
    "/issue/list",
    "/issue/kanban",
    "/issue/create",
    "/issue/:issueId",
    "/issue/:issueId/update",

    // 회의
    "/meeting/list",
    "/meeting/create",
    "/meeting/:meetingId",
    "/meeting/:meetingId/update",
    "/meeting/schedule",

    // 나의 업무
    "/mytask/issue/list",
    "/mytask/issue/kanban",
    "/mytask/meeting",
    "/mytask/schedule",

    // 관리자
    "/admin/member",
    "/admin/logs",
    "/admin/setting",
  ];

  return (
    <nav aria-label="breadcrumb" className="mb-4">
      <ol className="flex items-center space-x-6 text-sm text-gray-500">
        {pathnames.map((value, index) => {
          const to = `/${pathnames.slice(0, index + 1).join("/")}`;
          const isLast = index === pathnames.length - 1;
          const name = breadcrumbNameMap[value] || value;

          // 링크로 만들 경로인지 확인
          const isValidLink = validPaths.some((path) => {
            // 동적 경로 처리: /issue/:issueId 등
            if (path.includes(":")) {
              const regexPath = new RegExp(
                "^" + path.replace(/:\w+/g, "\\w+") + "$"
              );
              return regexPath.test(to);
            }
            return path === to;
          });

          return (
            <li key={to} className="flex items-center">
              {index !== 0 && <span className="mx-2">/</span>}
              {isLast || !isValidLink ? (
                <span className="text-gray-700 font-semibold">{name}</span>
              ) : (
                <Link to={to} className="hover:text-gray-700">
                  {name}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
