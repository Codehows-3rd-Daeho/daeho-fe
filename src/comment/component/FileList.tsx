import { Box, IconButton, Typography } from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import CloseIcon from "@mui/icons-material/Close"; // ✕ 아이콘 사용을 위해 import
import { BASE_URL } from "../../config/httpClient";
import { getFileInfo } from "../../common/commonFunction";

export interface FileItem {
  fileId: number;
  originalName: string;
  path: string;
  size?: string;
}

interface Props {
  files: FileItem[];
  // 파일 삭제 핸들러 추가: fileId를 받아서 처리
  onRemoveFile?: (fileId: number) => void;
}

export default function FileList({ files, onRemoveFile }: Props) {
  if (!files || files.length === 0) return null;

  // onRemoveFile이 있으면 삭제 모드
  const isRemovable = !!onRemoveFile;

  return (
    <Box sx={{ mb: 2 }}>
      {/* 파일 리스트 */}
      {files.map((file) => {
        const { label, color } = getFileInfo(file.originalName);

        return (
          <Box
            key={file.fileId}
            sx={{
              display: "grid",
              // onRemoveFile이 있으면 삭제 버튼 공간을 위해 gridTemplateColumns 변경
              gridTemplateColumns: isRemovable
                ? "1fr 120px 50px 50px"
                : "1fr 120px 150px 50px",
              alignItems: "center",
              px: 2,
              py: 1.5,
              bgcolor: "#fafafa",
              borderRadius: 1.5,
              mb: 1,
            }}
          >
            {/* 파일 이름 + 아이콘 */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <Box
                sx={{
                  width: 32,
                  height: 32,
                  bgcolor: color,
                  borderRadius: 1,
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  color: "#fff",
                  fontSize: "0.7rem",
                  fontWeight: 700,
                }}
              >
                {label}
              </Box>
              <Typography
                component="a"
                href={`${BASE_URL}${file.path}`}
                download={file.originalName}
                sx={{
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {file.originalName}
              </Typography>
            </Box>

            {/* 크기 */}
            <Typography
              sx={{
                p: 0.5,
                justifySelf: "end",
                color: "text.secondary",
              }}
            >
              {file.size}
            </Typography>

            {/* 삭제 버튼 (수정 모드일 때만) */}
            {isRemovable && (
              <IconButton
                size="small"
                onClick={() => onRemoveFile(file.fileId)}
                sx={{ ml: 1 }}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            )}

            {/* 다운로드 버튼 */}
            <IconButton
              size="small"
              component="a"
              href={`${BASE_URL}${file.path}`}
              sx={{
                p: 0.5,
                justifySelf: "end",
              }}
              download={file.originalName}
            >
              <DownloadIcon fontSize="small" />
            </IconButton>
          </Box>
        );
      })}
    </Box>
  );
}
