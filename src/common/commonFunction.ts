// status 변환 함수
export function getStatusLabel(status: string) {
  switch (status) {
    case "PLANNED":
      return "진행전";
    case "IN_PROGRESS":
      return "진행중";
    case "COMPLETED":
      return "진행완료";
    default:
      return status;
  }
}
