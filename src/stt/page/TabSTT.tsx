import { useEffect, useState } from "react";
import { deleteSTT, getSTT, uploadContext, uploadSTT } from "../api/sttApi";
import { Box, Button, Typography, TextField } from "@mui/material";

import UploadFileIcon from "@mui/icons-material/UploadFile";

import CloseIcon from "@mui/icons-material/Close";
import { useParams } from "react-router-dom";
import axios from "axios";
import type { STT } from "../type/type";

export default function TabSTT() {
  const { meetingId } = useParams();

  // STT 내용을 상태로 관리
  const [stts, setStts] = useState<STT[]>([]);
  const [selectedSttId, setSelectedSttId] = useState<number | null>(null);
  //등록 상태(등록 후 업로드란 안보이게)
  const [isUploaded, setIsUploaded] = useState(false);

  //daglo 최대 업로드 용량, 허용 확장자
  const maxFileSizeMB = 2 * 1000; //2GB (MB)
  const allowedExtensions = [
    // audio
    "3gp",
    "3gpp",
    "ac3",
    "aac",
    "aiff",
    "amr",
    "au",
    "flac",
    "m4a",
    "mp3",
    "mxf",
    "opus",
    "ra",
    "wav",
    "weba",

    // video
    "asx",
    "avi",
    "ogm",
    "ogv",
    "m4v",
    "mov",
    "mp4",
    "mpeg",
    "mpg",
    "wmv",
  ];

  useEffect(() => {
    if (!meetingId) return;

    const fetch = async () => {
      try {
        const response = await getSTT(meetingId);
        setStts(response);

        // ✅ STT가 있으면 업로드 완료 상태
        setIsUploaded(response.length > 0);

        //자동 선택
        setSelectedSttId((prev) => {
          if (prev && response.some((stt) => stt.id === prev)) {
            return prev; // 기존 선택 유지
          }
          return response[0]?.id ?? null; // 없으면 첫 번째
        });
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 404) {
          setStts([]);
        } else {
          console.error("STT 불러오기 실패:", error);
        }
      }
    };

    fetch();
  }, [meetingId]);

  const selectedStt = stts.find((stt) => stt.id === selectedSttId);

  // 파일 입력창 열기
  const openFileInput = () => {
    document.getElementById("fileUpload")?.click();
  };

  // ========================================================================
  //                               파일 검증
  // ========================================================================

  const validateFile = (file: File): boolean => {
    const ext = file.name.split(".").pop()?.toLowerCase();
    if (!ext || !allowedExtensions.includes(ext)) {
      alert(
        `허용되지 않은 파일: ${
          file.name
        }\n허용 확장자: ${allowedExtensions.join(", ")}`
      );
      return false;
    }

    const sizeMB = file.size / 1024 / 1024;
    if (sizeMB > maxFileSizeMB) {
      alert(
        `${
          file.name
        } 파일의 크기가 ${maxFileSizeMB}MB를 초과했습니다. (현재: ${sizeMB.toFixed(
          2
        )}MB)`
      );
      return false;
    }

    return true;
  };

  // ========================================================================
  //                               파일 선택
  // ========================================================================

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!meetingId) {
      alert("해당 회의의 id를 찾을 수 없습니다.");
      return;
    }
    const file = e.target.files?.[0];
    if (!file) return;

    handleUploadFile(file);

    // 같은 파일 다시 선택 가능하도록 초기화
    e.target.value = "";
  };

  // ========================================================================
  //                               드래그 앤 드롭
  // ========================================================================

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();

    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    if (e.dataTransfer.files.length > 1) {
      alert("파일은 1개만 등록할 수 있습니다.");
      return;
    }

    handleUploadFile(file);
  };

  //겹침 방지
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  // ========================================================================
  //                               등록
  // ========================================================================

  const handleUploadFile = async (file: File) => {
    if (!meetingId) {
      alert("해당 회의의 id를 찾을 수 없습니다.");
      return;
    }

    if (!validateFile(file)) return;

    const ok = window.confirm("음성 파일을 등록하시겠습니까?");
    if (!ok) return;

    setIsUploaded(true); //업로드란 안보이게

    try {
      const formData = new FormData();
      formData.append("file", file);

      //1. 음성 파일 변환
      await uploadSTT(meetingId, formData);

      //변환 결과 조회
      const response = await getSTT(meetingId);

      //변환된 STT를 화면에서 선택 상태로 만듦
      const newStt = response[0];

      setStts(response);
      setSelectedSttId(newStt.id);

      alert("음성 파일이 변환 되었습니다!");

      //2. 요약
      await uploadContext(newStt.id, newStt.content); //id넣어야됨

      alert("요약 완료!");

      //변환 결과 조회
      const updated = await getSTT(meetingId!);
      setStts(updated);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 401) return;
      alert("음성 파일 등록 중 오류가 발생했습니다.");
      setIsUploaded(false); //업로드란 보이게
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
        음성 파일 변환
      </Typography>

      {/* stt 헤더 바 */}
      <Box display="flex" alignItems="center" gap={1}>
        {/* 첨부 파일 */}
        {!isUploaded && (
          <Box sx={{ mb: 3 }}>
            <Typography sx={{ fontWeight: 600, fontSize: "0.875rem", mb: 1 }}>
              첨부 파일
            </Typography>

            <input
              type="file"
              multiple
              id="fileUpload"
              style={{ display: "none" }}
              onChange={handleFileSelect}
            />

            <Box
              sx={{
                border: "2px dashed #d0d0d0",
                borderRadius: 2,
                p: 3,
                textAlign: "center",
                cursor: "pointer",
                transition: "all 0.2s",
                "&:hover": {
                  bgcolor: "#fafafa",
                  borderColor: "#999",
                },
              }}
              onClick={openFileInput}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
            >
              <UploadFileIcon sx={{ fontSize: 48, color: "#9e9e9e", mb: 1 }} />
              <Typography
                sx={{ fontSize: "0.875rem", fontWeight: 500, mb: 0.5 }}
              >
                Choose files or Drag and Drop
              </Typography>
              <Typography
                sx={{ fontSize: "0.875rem", fontWeight: 500, mb: 0.5 }}
              >
                최대 파일 크기: 2GB
              </Typography>
              <Typography
                sx={{ fontSize: "0.875rem", fontWeight: 500, mb: 0.5 }}
              >
                허용 확장자: {allowedExtensions?.join(", ")}
              </Typography>
            </Box>
          </Box>
        )}

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
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete();
                }}
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
      </Box>

      {isUploaded && (
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
            </Box>
          </Box>
        </Box>
      )}
    </>
  );
}
