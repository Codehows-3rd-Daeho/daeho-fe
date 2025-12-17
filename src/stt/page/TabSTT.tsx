import { useEffect, useState } from "react";
import { deleteSTT, getSTT, uploadContext, uploadSTT } from "../api/sttApi";
import {
  Box,
  Button,
  Typography,
  TextField,
  Tabs,
  Tab,
  IconButton,
} from "@mui/material";

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
  //등록 상태(등록 후 업로드란 안보이게, true: 업로드 화면, false: 결과화면)
  const [isUploadMode, setIsUploadMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState("로딩중. . .");

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

        //업로드 화면 or 결과 화면
        if (response.length === 0) {
          setIsUploadMode(true); // 처음이면 업로드 화면
        } else {
          setIsUploadMode(false); // STT 있으면 결과 화면
          setSelectedSttId(response[0].id);
        }

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
          setIsUploadMode(true)
        } else {
          console.error("STT 불러오기 실패:", error);
        }
      }
    };

    fetch();
  }, [meetingId]);

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

    setIsLoading(true);
    setLoadingText("음성 파일을 변환 중 입니다. . .")
    setIsUploadMode(false); //결과란 보이게

    //새탭 생성시 임시 탭 생성
    const TEMP_STT_ID = -1;

    setStts((prev) => [
      ...prev,
      {
        id: TEMP_STT_ID,
        meetingId: meetingId,
        content: "",
        summary: "",
      } as STT,
    ]);

    setSelectedSttId(TEMP_STT_ID);

    try {
      const formData = new FormData();
      formData.append("file", file);

      //1. 음성 파일 변환
      await uploadSTT(meetingId, formData);

      //변환 결과 조회
      const response = await getSTT(meetingId);
      setLoadingText("음성 파일이 변환 되었습니다!")

      //변환된 STT를 화면에서 선택 상태로 만듦

      const newStt = response[response.length - 1];

      setStts(response);
      setSelectedSttId(newStt.id);

      //2. 요약
      setLoadingText("요약을 시작합니다. . .");

      await uploadContext(newStt.id, newStt.content); //id넣어야됨

      setLoadingText("요약 완료. . .");

      //변환 결과 조회
      const updated = await getSTT(meetingId!);
      setStts(updated);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 401) return;
      alert("음성 파일 등록 중 오류가 발생했습니다.");
      setStts((prev) => prev.filter((stt) => stt.id !== TEMP_STT_ID));
      setIsUploadMode(true); //업로드란 보이게
    } finally {
      setIsLoading(false);
    }
  };

  // ========================================================================
  //                               삭제
  // ========================================================================

  const handleDelete = async (sttId: number) => {
    if (!selectedSttId) {
      alert("삭제할 STT가 선택되지 않았습니다.");
      return;
    }

    const isConfirmed = window.confirm("음성 파일을 삭제하시겠습니까?");
    if (!isConfirmed) return;

    try {
      await deleteSTT(sttId);
      // 상태에서 삭제
      setStts((prev) => {
        const updated = prev.filter((stt) => stt.id !== sttId);
        // 선택된 STT가 삭제되면 다음 STT 선택
        setSelectedSttId((current) => {
          if (current !== sttId) return current;
          return updated[0]?.id ?? null;
        });

        return updated;
      });

      alert("음성 파일이 삭제되었습니다.");
      setIsUploadMode(true);
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
      <Box display="flex" alignItems="center" mb={3} gap={1}>
        {/* STT 버튼들 */}
        <Tabs
          value={selectedSttId}
          onChange={(_, newValue) => { 
            setSelectedSttId(newValue)
            setIsUploadMode(false)
          }}
        >
          {stts.map((stt, index) => (
            <Tab
              key={stt.id}
              value={stt.id}
              sx={{padding: '0px 2px'}}
              label={
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  {index + 1}
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(stt.id);
                    }}
                  >
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </Box>
              }
            />
          ))}
        </Tabs>
        <Button
          variant="outlined"
          onClick={() => {
            setIsUploadMode(true)
            setSelectedSttId(-1);
          }}
          sx={{ minWidth: 40 }}
        >
          +
        </Button>
      </Box>

      {/* 첨부 파일 */}
      <Box>
        {isUploadMode && (
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
      </Box>
      
      <div className="relative">
        {isLoading && (
          <div className="absolute inset-0 bg-black/20 backdrop-blur-none z-40 flex items-center justify-center rounded-lg">
            <div className="bg-white/50 p-6 rounded-xl shadow-2xl flex flex-col items-center gap-3">
              <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin"></div>
              <span className="text-sm font-medium text-gray-700">{loadingText}</span>
            </div>
          </div>
        )}
        {!isUploadMode && (
          <Box>
            <Box sx={{ display: "flex", gap: 2, alignItems: "start", mt: 3 }}>
              <Box sx={{ flex: 1 }}>
                <Typography>요약 결과</Typography>
                <TextField
                  fullWidth
                  multiline
                  rows={10}
                  value={stts.find((stt) => stt.id === selectedSttId)?.summary ?? "텍스트 없음"}
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
                  value={stts.find((stt) => stt.id === selectedSttId)?.content ?? "텍스트 없음"}
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
      </div>
    </>
  );
}
