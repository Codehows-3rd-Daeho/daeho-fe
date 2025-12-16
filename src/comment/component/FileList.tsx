import { Box, IconButton, Typography } from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
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
}

export default function FileList({ files }: Props) {
  if (!files || files.length === 0) return null;

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
              gridTemplateColumns: "1fr 120px 150px 50px",
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
              >
                {file.originalName}
              </Typography>
            </Box>

            {/* 크기 */}
            <Typography sx={{ color: "text.secondary" }}>
              {file.size}
            </Typography>

            {/* 다운로드 버튼 */}
            <IconButton
              size="small"
              component="a"
              href={`${BASE_URL}${file.path}`}
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
