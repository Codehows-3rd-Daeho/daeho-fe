import { useEffect, useState, type SetStateAction } from "react";
import { deleteSTT, getSTT, saveCurrentStt, uploadContext, uploadSTT } from "../api/sttApi";
import {
  Box,
  Button,
  Typography,
  TextField,
  Tabs,
  Tab,
  IconButton,
  Tooltip,
} from "@mui/material";

import UploadFileIcon from "@mui/icons-material/UploadFile";

import CloseIcon from "@mui/icons-material/Close";
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import { useParams } from "react-router-dom";
import axios from "axios";
import type { STT } from "../type/type";

export default function TabSTT() {
  const { meetingId } = useParams();

  // STT 내용을 상태로 관리
  const [stts, setStts] = useState<STT[]>([]);
  const [selectedSttId, setSelectedSttId] = useState<number | null>(null);

  //daglo 최대 업로드 용량, 허용 확장자
  const maxFileSizeMB = 2 * 1024; //2GB (MB)
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
        if (response.length !== 0)
          setSelectedSttId(response[0].id);

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
    setIsDragOver(false);

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

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.currentTarget.contains(e.relatedTarget as Node)) {
      return;
    }
    setIsDragOver(false);
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

    updateSttIsLoading(selectedSttId, true);
    updateSttIsTemp(selectedSttId, false);

    try {
      const formData = new FormData();
      formData.append("file", file);

      //1. 음성 파일 변환
      await uploadSTT(meetingId, formData);

      //변환 결과 조회
      const response = await getSTT(meetingId);
      const newStt = response[response.length - 1];
      await uploadContext(newStt.id, newStt.content); //id넣어야됨
      const summaray = (await getSTT(meetingId))[response.length - 1].summary;

      console.log(newStt);
      setStts(prevStts => 
        prevStts.map(stt => 
          stt.id === selectedSttId 
            ? { ...newStt,
              summary: summaray,
              isEditable: false,
              isLoading: false,
              isTemp: false
            }
            : stt
        )
      )
      setSelectedSttId(newStt.id);
      
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 401) return;
      alert("음성 파일 등록 중 오류가 발생했습니다.");
      setStts((prev) => prev.filter((stt) => stt.id !== selectedSttId));
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
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        return;
      }
      alert("stt 삭제 중 오류가 발생했습니다.");
    }
  };

  const handleTabChange = async (_event: unknown, newValue: SetStateAction<number | null>) => {
    handleSummarySave();
    setSelectedSttId(newValue);
  };

  const updateSttEditable = (selectedSttId: number | null, editable: boolean) => {
    setStts(prevStts => 
      prevStts.map(stt => 
        stt.id === selectedSttId 
          ? { ...stt, isEditable: editable }
          : stt
      )
    ) 
  }

  const updateSttIsLoading = (selectedSttId: number | null, isLoading: boolean) => {
    setStts(prevStts => 
      prevStts.map(stt => 
        stt.id === selectedSttId 
          ? { ...stt, isLoading: isLoading }
          : stt
      )
    ) 
  }

  const updateSttIsTemp = (selectedSttId: number | null, isTemp: boolean) => {
    setStts(prevStts => 
      prevStts.map(stt => 
        stt.id === selectedSttId 
          ? { ...stt, isTemp: isTemp }
          : stt
      )
    ) 
  }
  
  const handleSummaryChange = (event) => {
    const newSummary = event.target.value;
    setStts(prevStts => 
      prevStts.map(stt => 
        stt.id === selectedSttId 
          ? { ...stt, summary: newSummary }
          : stt
      )
    );
  };

  const handleSummarySave = async () => {
    const currentStt = stts.find(s => s.id === selectedSttId);
    
    if (currentStt?.isEditable) {
      const confirmed = window.confirm(
        '변경된 내용을 저장하시겠습니까?'
      );
      
      if (confirmed) {
        // 저장 로직 호출 (예: saveCurrentStt())
        await saveCurrentStt(currentStt.id, currentStt.summary);
      }
      
      // 저장 여부와 상관없이 isEditable false로 변경
      updateSttEditable(selectedSttId, false);
      
    }
  }

  const findSttById = (selectedSttId: number | null): STT | null => {
    return stts.find(s => s.id === selectedSttId) ?? null;
  }

  const [isDragOver, setIsDragOver] = useState(false);

  const addTempSttTab = () => {
    if(stts[stts.length-1]?.isTemp === true ||
      stts[stts.length-1]?.isLoading === true
    ) return;

    //새탭 생성시 임시 탭 생성
    const NEW_STT_ID = -1;

    setStts((prev) => [
      ...prev,
      {
        id: NEW_STT_ID,
        meetingId: meetingId,
        content: "",
        summary: "",
        isEditable: false,
        isLoading: false,
        isTemp: true,
      } as STT,
    ]);

    setSelectedSttId(NEW_STT_ID);
  }

  return (
    <>
      {/* STT 제목 */}
      <Typography fontWeight={600} mb={1}>
        음성 파일 변환
        <Button
          variant="outlined"
          onClick={() => {
            addTempSttTab();
          }}
          sx={{ 
            minWidth: 40,
            marginLeft: '10px'
          }}
        >
          +
        </Button>
      </Typography>
      

      {/* stt 헤더 바 */}
      <Box display="flex" alignItems="center" mb={1} gap={1}>
        {/* STT 버튼들 */}
        <Tabs
          key={`${selectedSttId}-${stts.length}`} 
          value={selectedSttId}
          onChange={handleTabChange}
          variant="scrollable"           // 스크롤 가능하게 설정
          scrollButtons         // 자동 스크롤 버튼 표시
          sx={{
            '& .MuiTab-root': {
              transition: 'all 0.1s ease',
              position: 'relative',
              backgroundColor: 'rgba(0,0,0,0.05)',
              borderRadius: '5px',
              margin: '0 4px',
              padding: '0 12px',
              
              // 모든 탭(첫번째 제외)에 동일한 위치의 구분선
              '&:not(:first-of-type)::before': {
                content: '""',
                position: 'absolute',
                left: '-2px',              // margin 절반만큼 왼쪽으로 이동
                top: '20%',
                height: '60%',
                width: '1px',
                backgroundColor: 'rgba(0,0,0,0.12)',
                zIndex: 2,
              },
            },
            '&.Mui-selected': {
              backgroundColor: 'white',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              fontWeight: "bold",
              color: 'primary.main',
              // 선택탭에서도 구분선 유지 (제거하지 않음)
            },
            '& .MuiTabs-scroller': {
              '&:not(.MuiTabs-scrollButtonsHide)': {
                paddingRight: '48px',  // 버튼 공간 예약
              }
            },
            maxWidth: '1000px',
            '& .MuiTabs-flexContainer': {
              justifyContent: 'flex-start',  // 왼쪽 정렬
              gap: '4px',                    // 탭 간격
            },
          }}
        >
          {stts.map((stt, index) => (
            <Tab
              key={stt.id}
              value={stt.id}
              sx={{
                paddingRight: '8px',
              }}
              label={
                <Box sx={{ 
                    display: "flex", 
                    alignItems: "center", 
                    textTransform: 'none',
                  }}>
                  {stt.isTemp ? "New Tab" : "Tab " + (index+1)}
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
      </Box>
      
      <div className="relative">
        {findSttById(selectedSttId)?.isLoading && !findSttById(selectedSttId)?.isTemp ? (
          <div className="absolute inset-0 bg-black/20 backdrop-blur-none z-40 flex items-center justify-center rounded-lg">
            <div className="bg-white/50 p-6 rounded-xl shadow-2xl flex flex-col items-center gap-3">
              <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin"></div>
            </div>
          </div>
        ) : <></>}
        {findSttById(selectedSttId)?.isTemp ? (
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
              border: isDragOver ? "3px dashed #007bff" : "2px dashed #d0d0d0",
              borderRadius: 2,
              p: 3,
              textAlign: "center",
              cursor: "pointer",
              transition: "all 0.2s ease",
              bgcolor: isDragOver ? "#e3f2fd" : "transparent",
              "&:hover": {
                bgcolor: "#fafafa",
                borderColor: "#999",
              },
            }}
            onClick={openFileInput}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
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
        ):
        (stts.length !== 0 &&
        <Box>
          <Box sx={{ display: "flex", gap: 2, alignItems: "start", mt: 3 }}>
            <Box sx={{ flex: 1 }}>
              <Typography>
                요약 결과
                <Tooltip title={findSttById(selectedSttId)?.isEditable ? "저장" : "수정"} placement="top">
                  <IconButton 
                    size="small" 
                    sx={{ color: 'primary.main' }}
                    disabled={findSttById(selectedSttId)?.isLoading}
                  >
                    {findSttById(selectedSttId)?.isEditable ? 
                    <SaveIcon 
                      onClick = {() => {
                        handleSummarySave();
                      }}
                    /> 
                    : <EditIcon 
                      onClick = {() => {
                        updateSttEditable(selectedSttId, true);
                      }}
                    />}
                  </IconButton>
                </Tooltip>
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={10}
                value={
                  (findSttById(selectedSttId)?.isLoading)
                    ? "요약 생성 중..."
                    : findSttById(selectedSttId)?.summary ?? "텍스트 없음"
                }
                onChange={handleSummaryChange}
                sx={{
                  mt: 1,
                  mb: 2,
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 1.5,
                    bgcolor: findSttById(selectedSttId)?.isLoading ? "#f0f0f0" : "#fafafa",
                  },
                  "& .MuiInputBase-input.Mui-disabled": {
                    WebkitTextFillColor: "#000000",
                    color: "#000000",
                  },
                }}
                disabled={!findSttById(selectedSttId)?.isEditable}
              />
              <Typography>회의 내용</Typography>
              <TextField
                fullWidth
                multiline
                value={
                  (findSttById(selectedSttId)?.isLoading) 
                    ? "음성 파일 변환 중..." 
                    : findSttById(selectedSttId)?.content ?? "텍스트 없음"
                }
                rows={15}
                sx={{
                  mt: 1,
                  mb: 2,
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 1.5,
                    bgcolor: "#fafafa",
                  },
                  "& .MuiInputBase-input.Mui-disabled": {
                    WebkitTextFillColor: "#000000",
                    color: "#000000",
                  },
                }}
                disabled
              />
            </Box>
          </Box>
        </Box>
        )}
      </div>
    </>
  );
}
