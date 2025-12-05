import { Box, Typography, TextField, Divider, Button } from "@mui/material";
import React, { useEffect, useState, type KeyboardEvent } from "react";
import type { SetTagList, TagItem } from "../page/AdminSetting";
import type { MasterDataType } from "../type/SettingType";
import {
  getFileSize,
  saveExtension,
  saveFileSize,
} from "../api/FileSettingApi";
import axios from "axios";

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
  const [fileSizeInput, setFileSizeInput] = useState<string>(""); // masterDataType이 string이라서
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [extensionInput, setExtensionInput] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getFileSize();
        const byteValue = response.name;
        const mbValue = parseInt(byteValue) / (1024 * 1024);
        setFileSizeInput(mbValue.toString());
      } catch (error) {
        console.log("파일 설정 불러오기 실패 ", error);
      }
    };
    fetchData();
  }, []);

  const handleFileSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // 숫자가 아닌 입력은 무시
    if (value === "" || /^\d+$/.test(value)) {
      setFileSizeInput(value);
    }
    // 숫자 또는 소수점 포함 숫자만 허용
    if (/^\d*\.?\d*$/.test(value)) {
      setFileSizeInput(value);
    }
  };
  const handleFileSizeSave = async () => {
    const size = parseFloat(fileSizeInput);
    if (isNaN(size) || size < 0) {
      alert("유효한 값을 입력해주세요.");
      return;
    }
    setIsSaving(true);

    const data: MasterDataType = {
      name: size.toString(),
    };

    try {
      await saveFileSize(data);
      alert("저장되었습니다.");
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        return;
      }
      // 다른 alert
      alert("오류가 발생했습니다.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleExtensionKeyDown = async (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== "Enter") return; //Enter 말고

    // 양쪽 공백 제거
    const rawValue = extensionInput.trim();
    if (!rawValue) return; // 빈문자

    // 소문자로 변환, 점 제거
    const ext = rawValue.toLowerCase().replace(".", "");
    const data: MasterDataType = {
      name: ext,
    };

    try {
      const response = await saveExtension(data);
      const newTag: TagItem = {
        id: response.id || Date.now(),
        label: response.name,
      };
      setFileExtensions((prev) => [...prev, newTag]);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        const { status, data } = error.response;
        if (status === 400) {
          // 중복
          alert(data);
          return;
        }
        if (status === 401) return;
      }
      console.error("등록 실패:", error);
      alert("등록 중 오류가 발생했습니다.");
    }
    setExtensionInput("");
  };

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
          gap: 3,
          flexDirection: "column",
        }}
      >
        {/* 파일 용량 설정 */}
        <Box sx={{ flexGrow: 1, minWidth: 250 }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
            }}
          >
            <Typography
              variant="subtitle1"
              sx={{ textAlign: "left", width: 140, whiteSpace: "nowrap" }}
            >
              최대 용량 설정 (MB)
            </Typography>

            {/* 입력 필드와 버튼 그룹 */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                flexGrow: 1,
              }}
            >
              <TextField
                type="number"
                variant="outlined"
                size="small"
                placeholder="숫자(MB)만 입력해주세요"
                value={fileSizeInput}
                onChange={handleFileSizeChange}
                sx={{ flexGrow: 1, mr: 2 }}
              />
              <Button
                variant="outlined"
                color="primary"
                sx={{ height: "40px", minWidth: "auto" }}
                onClick={handleFileSizeSave}
                disabled={isSaving}
              >
                {isSaving ? "저장 중..." : "저장"}
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
              허용 확장자 설정
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
                value={extensionInput}
                onKeyDown={handleExtensionKeyDown}
                onChange={(e) => {
                  setExtensionInput(e.target.value);
                }}
                sx={{ flexGrow: 1 }}
              />
            </Box>
            <Button
              variant="outlined"
              color="primary"
              sx={{ height: "40px", minWidth: "auto", visibility: "hidden" }}
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
