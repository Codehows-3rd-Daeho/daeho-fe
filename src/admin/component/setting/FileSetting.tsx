import { Box, Typography, TextField, Divider, Button } from "@mui/material";
import React from "react";
import type { SetTagList, TagItem } from "../../page/setting/AdminSetting";

interface FileSettingProps {
  fileExtensions: TagItem[];
  setFileExtensions: SetTagList;
  RenderChips: React.FC<{ list: TagItem[]; setList: SetTagList }>;
}

export default function FileSetting({
  fileExtensions,
  setFileExtensions,
  RenderChips,
}: FileSettingProps) {
  return (
    <Box sx={{ mb: 4 }}>
      <Typography
        variant="h5"
        gutterBottom
        sx={{ fontWeight: 600, textAlign: "left" }}
      >
        파일 설정 관리
      </Typography>
      <Divider sx={{ mb: 2 }} />
      <Box
        sx={{
          display: "flex",
          gap: 3, // 항목 간 간격 조정
          flexDirection: "column",
        }}
      >
        {/* 파일 용량 설정 */}
        <Box sx={{ flexGrow: 1, minWidth: 250 }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2, // 제목과 입력 그룹 사이 간격
            }}
          >
            <Typography
              variant="subtitle1"
              sx={{ textAlign: "left", width: 140, whiteSpace: "nowrap" }}
            >
              파일 용량 설정 (MB)
            </Typography>

            {/* 입력 필드와 버튼 그룹 */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                flexGrow: 1, // 남은 공간을 차지
              }}
            >
              <TextField
                type="number"
                variant="outlined"
                size="small"
                sx={{ flexGrow: 1, mr: 2 }} // 버튼과의 간격 mr: 2로 조정
              />
              <Button
                variant="outlined"
                color="primary"
                sx={{ height: "40px", minWidth: "auto" }} // 버튼 크기 유지
              >
                저장
              </Button>
            </Box>
          </Box>
        </Box>
        {/* 파일 확장자 설정 */}
        <Box sx={{ flexGrow: 1, minWidth: 250 }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              mb: 1.5,
            }}
          >
            <Typography
              variant="subtitle1"
              sx={{ textAlign: "left", width: 140, whiteSpace: "nowrap" }}
            >
              파일 확장자 설정
            </Typography>

            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                flexGrow: 1,
              }}
            >
              <TextField
                placeholder="Enter 로 등록"
                variant="outlined"
                size="small"
                sx={{ flexGrow: 1 }}
              />
            </Box>
            <Button
              variant="outlined"
              color="primary"
              sx={{ height: "40px", minWidth: "auto", visibility: "hidden" }} // 버튼 크기 유지
            >
              저장
            </Button>
          </Box>

          <RenderChips list={fileExtensions} setList={setFileExtensions} />
        </Box>
      </Box>
    </Box>
  );
}
