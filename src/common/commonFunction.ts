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

// 확장자별 색상
export function getFileInfo(filename: string) {
  const ext = filename.includes(".")
    ? filename.split(".").pop()?.toLowerCase()
    : "";

  let color = "#9e9e9e"; // 기본 회색

  if (ext === "pdf") {
    color = "#ff6b6b"; // 빨강
  } else if (["png", "jpg", "jpeg", "gif", "webp"].includes(ext || "")) {
    color = "#42a5f5"; // 파랑
  } else if (["xlsx", "xls"].includes(ext || "")) {
    color = "#4caf50"; // 초록
  }

  return {
    label: ext ? ext.toUpperCase() : "FILE",
    color,
  };
}

export function formatFileSize(size: number) {
  if (size < 1024 * 1024) {
    // KB 단위
    return `${Math.round(size / 1024)} KB`;
  }

  // MB 단위 (정수면 .0 제거)
  const mb = size / (1024 * 1024);
  const formatted = mb % 1 === 0 ? mb.toString() : mb.toFixed(1);

  return `${formatted} MB`;
}
