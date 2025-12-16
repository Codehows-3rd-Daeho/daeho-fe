import { useEffect, useState } from "react";
import { deleteSTT, getSTT, uploadContext } from "../api/sttApi";
import TabSTTModal from "./TabSTTModal";
import { Box, Button, Typography, TextField } from "@mui/material";

import CloseIcon from "@mui/icons-material/Close";
import { useParams } from "react-router-dom";
import axios from "axios";
import type { STT } from "../type/type";

export default function TabSTT() {
  const { meetingId } = useParams();

  // STT 내용을 상태로 관리
  const [stts, setStts] = useState<STT[]>([]);
  const [selectedSttId, setSelectedSttId] = useState<number | null>(null);
  //새파일 등록시 재로딩을 위해 사용
  const [refresh, setRefresh] = useState(false);
  //저장 상태 (지연시 중복 등록 방지)
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    // useEffect 내부에 async 함수 정의
    const fetchSTT = async () => {
      try {
        const response = await getSTT(meetingId!);
        setStts(response);

        // 첫 번째 STT 자동 선택
        if (response.length > 0) {
          setSelectedSttId(response[0].id);
        }
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 404) {
          // DB에 값이 없을 때
          setStts([]);
        } else {
          console.error("STT 불러오기 실패:", error);
        }
      }
    };

    fetchSTT();
  }, [meetingId, refresh]);

  const selectedStt = stts.find((stt) => stt.id === selectedSttId);

  const handleSummary = async () => {
    if (!selectedStt) return;

    try {
      setIsSaving(true);

      await uploadContext(selectedStt.id, selectedStt.content); //id넣어야됨

      alert("요약 완료!");

      // 요약 완료 후 다시 STT 가져오기
      const response = await getSTT(meetingId!);
      setStts(response);
      // 기존 선택 유지
      const updatedStt = response.find((stt) => stt.id === selectedStt.id);
      setSelectedSttId(updatedStt?.id ?? null);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 401) return;
      console.error(error);
      alert("파일 요약 중 오류가 발생했습니다.");
    } finally {
      setIsSaving(false);
    }
  };

  // ========================================================================
  //                               삭제
  // ========================================================================

  const handleDelete = async () => {
    if (!selectedStt) {
      alert("삭제할 STT가 선택되지 않았습니다.");
      return;
    }

    const isConfirmed = window.confirm("음성 파일을 삭제하시겠습니까?");
    if (!isConfirmed) return;

    try {
      await deleteSTT(selectedStt.id);

      // 상태에서 삭제
      setStts((prev) => prev.filter((stt) => stt.id !== selectedStt.id));

      // 선택된 STT가 삭제되면 다음 STT 선택
      if (selectedSttId === selectedStt.id) {
        const remaining = stts.filter((stt) => stt.id !== selectedStt.id);
        setSelectedSttId(remaining[0]?.id ?? null);
      }

      alert("음성 파일이 삭제되었습니다.");
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        return;
      }
      alert("stt 삭제 중 오류가 발생했습니다.");
    }
  };

  return (
    <>
      {/* STT 제목 */}
      <Typography fontWeight={600} mb={2}>
        STT
      </Typography>

      {/* stt 헤더 바 */}
      <Box display="flex" alignItems="center" gap={1}>
        {/* STT 버튼들 */}
        <Box display="flex" gap={1}>
          {stts.map((stt, index) => (
            <Button
              key={stt.id}
              variant={selectedSttId === stt.id ? "contained" : "outlined"}
              onClick={() => setSelectedSttId(stt.id)}
              sx={{
                width: "100px",
                display: "flex",
                justifyContent: "space-between", // 좌우로 밀기
                alignItems: "center",
                padding: "4px 8px", // 적절한 여백
              }}
            >
              {index + 1}
              <Button
                onClick={handleDelete}
                sx={{
                  minWidth: 0, // 버튼 최소 너비 제거
                  padding: 0, // 안쪽 여백 제거
                  width: "auto", // 자동 너비
                }}
              >
                <CloseIcon fontSize="small" sx={{ color: "black" }} />
              </Button>
            </Button>
          ))}
        </Box>

        {/* 업로드 버튼 - 오른쪽 정렬 */}
        <Box ml="auto">
          <TabSTTModal onUploadSuccess={() => setRefresh((prev) => !prev)} />
        </Box>
      </Box>

      <Box>
        <Box sx={{ display: "flex", gap: 2, alignItems: "start", mt: 3 }}>
          <Box sx={{ flex: 1 }}>
            <Typography>요약 결과</Typography>
            <TextField
              fullWidth
              multiline
              rows={10}
              value={selectedStt?.summary ?? "텍스트 없음"}
              disabled
              sx={{
                mb: 2,
                "& .MuiOutlinedInput-root": {
                  borderRadius: 1.5,
                  bgcolor: "#fafafa",
                },
              }}
            />
            <Typography>회의 내용</Typography>
            <TextField
              fullWidth
              multiline
              value={selectedStt?.content ?? "텍스트 없음"}
              rows={15}
              sx={{
                mb: 2,
                "& .MuiOutlinedInput-root": {
                  borderRadius: 1.5,
                  bgcolor: "#fafafa",
                },
              }}
            />

            <Box sx={{ display: "flex", gap: 1, justifyContent: "flex-end" }}>
              <Button
                variant="outlined"
                size="small"
                onClick={handleSummary}
                sx={{ borderRadius: 1.5 }}
              >
                {isSaving ? "요약 중..." : "요약하기"}
              </Button>
            </Box>
          </Box>
        </Box>
      </Box>
    </>
  );
}
