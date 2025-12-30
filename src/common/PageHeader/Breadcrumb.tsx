import { useEffect, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import { getIssueDtl } from "../../issue/api/issueApi";
import { getMeetingDtl } from "../../meeting/api/MeetingApi";
import type { ApiError } from "../../config/httpClient";

export default function Breadcrumb() {
  //url 정보 가져오는 훅
  const location = useLocation();
  // 현재의 URL 경로 -> 문자 배열 + 빈문자열 제거
  const pathnames = location.pathname.split("/").filter((x) => x);

  //이름 매핑
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

  //이슈,회의 제목 매핑
  const [dynamicNameMap, setDynamicNameMap] = useState<Record<string, string>>(
    {}
  );

  //이슈 or 회의 + id추출
  const getResourceInfo = (pathname: string) => {
    const parts = pathname.split("/").filter(Boolean);

    //^ : 문자열 시작(")
    // \d+ : 숫자 1개 이상
    // $ : 문자열 끝(")
    if (parts[0] === "issue" && /^\d+$/.test(parts[1])) {
      return { type: "issue", id: parts[1] };
    }

    if (parts[0] === "meeting" && /^\d+$/.test(parts[1])) {
      return { type: "meeting", id: parts[1] };
    }

    return null;
  };

  useEffect(() => {
    const info = getResourceInfo(location.pathname);
    if (!info) return;

    // 이미 있으면 다시 호출하지 않음
    if (dynamicNameMap[info.id]) return;

    //이슈 제목 매핑
    if (info.type === "issue") {
      getIssueDtl(info.id)
        .then((res) => {
          setDynamicNameMap((prev) => ({
            ...prev,
            [info.id]: res.title,
          }));
        })
        .catch((error) => {
          const apiError = error as ApiError;
          const response = apiError.response?.data?.message;
          alert(response ?? "오류가 발생했습니다.");
        });
    }

    //회의 제목 매핑
    if (info.type === "meeting") {
      getMeetingDtl(info.id)
        .then((res) => {
          setDynamicNameMap((prev) => ({
            ...prev,
            [info.id]: res.title, // 또는 res.subject
          }));
        })
        .catch((error) => {
          const apiError = error as ApiError;
          const response = apiError.response?.data?.message;
          alert(response ?? "오류가 발생했습니다.");
        });
    }
  }, [location.pathname]);

  return (
    <nav aria-label="breadcrumb" className="mb-4">
      <ol className="flex items-center space-x-2 text-sm text-gray-500">
        {pathnames.map((value, index) => {
          const to = `/${pathnames.slice(0, index + 1).join("/")}`;
          const isLast = index === pathnames.length - 1;
          //표시할 이름 (id -> 제목, 고정 경로 -> 문자열, nothing -> value)
          const name =
            dynamicNameMap[value] || breadcrumbNameMap[value] || value;

          // 링크로 만들 경로인지 확인
          const isValidLink = validPaths.some((path) => {
            // 동적 경로 처리: /issue/:issueId 등
            if (path.includes(":")) {
              const regexPath = new RegExp(
                "^" + path.replace(/:\w+/g, "\\w+") + "$"
              );
              //breadcrumb 경로가 해당 패턴과 일치하는지 확인
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
