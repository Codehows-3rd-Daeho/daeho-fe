import { useEffect, useState, type SetStateAction, useRef } from "react";
import { deleteSTT, getSTT, saveCurrentStt, uploadContext, uploadSTT, startRecording, uploadAudioChunk, finishRecording } from "../api/sttApi";
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
import MicIcon from "@mui/icons-material/Mic";
import StopCircleIcon from "@mui/icons-material/StopCircle";
import PauseCircleIcon from "@mui/icons-material/PauseCircle";
import PlayCircleIcon from "@mui/icons-material/PlayCircle";

import CloseIcon from "@mui/icons-material/Close";
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import { useParams } from "react-router-dom";
import axios from "axios";
import type { STT } from "../type/type";

type RecordingStatus = "idle" | "recording" | "paused";

interface STTWithRecording extends STT {
  recordingStatus?: RecordingStatus;
  recordingTime?: number;
  liveSttId?: number | null;
}

export default function TabSTT() {
  const { meetingId } = useParams();

  // STT 내용을 상태로 관리
  const [stts, setStts] = useState<STTWithRecording[]>([]);
  const [selectedSttId, setSelectedSttId] = useState<number | null>(null);

  // refs for recording
  const mediaRecorderRef = useRef<{ [key: number]: MediaRecorder }>({});
  const timerIntervalRef = useRef<{ [key: number]: number }>({});
  const mediaStreamRef = useRef<{ [key: number]: MediaStream }>({});

  //daglo 최대 업로드 용량, 허용 확장자
  const maxFileSizeMB = 2 * 1024; //2GB (MB)
  const allowedExtensions = [
    "3gp", "3gpp", "ac3", "aac", "aiff", "amr", "au", "flac", "m4a",
    "mp3", "mxf", "opus", "ra", "wav", "weba", "asx", "avi", "ogm",
    "ogv", "m4v", "mov", "mp4", "mpeg", "mpg", "wmv",
  ];

  const findSttById = (sttId: number | null): STTWithRecording | null => {
    return stts.find(s => s.id === sttId) ?? null;
  }

  const updateSttState = (sttId: number | null, newProps: Partial<STTWithRecording>) => {
    if (sttId === null) return;
    setStts(prevStts =>
      prevStts.map(stt =>
        stt.id === sttId ? { ...stt, ...newProps } : stt
      )
    );
  };

  useEffect(() => {
    if (!meetingId) return;

    const fetch = async () => {
      try {
        const response = await getSTT(meetingId);
        const sttsWithRecordingState = response.map(stt => ({
          ...stt,
          recordingStatus: 'idle' as RecordingStatus,
          recordingTime: 0,
          liveSttId: null,
        }));
        setStts(sttsWithRecordingState);

        if (response.length !== 0) {
          setSelectedSttId(prev => {
            if (prev && response.some(stt => stt.id === prev)) return prev;
            return response[0]?.id ?? null;
          });
        } else {
            setSelectedSttId(null);
        }
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

  const openFileInput = () => {
    document.getElementById("fileUpload")?.click();
  };

  const validateFile = (file: File): boolean => {
    const ext = file.name.split(".").pop()?.toLowerCase();
    if (!ext || !allowedExtensions.includes(ext)) {
      alert(`허용되지 않은 파일 형식입니다: ${file.name}`);
      return false;
    }
    const sizeMB = file.size / 1024 / 1024;
    if (sizeMB > maxFileSizeMB) {
      alert(`파일 크기가 ${maxFileSizeMB}MB를 초과했습니다. (현재: ${sizeMB.toFixed(2)}MB)`);
      return false;
    }
    return true;
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!meetingId) return;
    const file = e.target.files?.[0];
    if (!file) return;
    handleUploadFile(file);
    e.target.value = "";
  };
  
  const [isDragOver, setIsDragOver] = useState(false);
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

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => e.preventDefault();
  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragOver(false);
    }
  };

  const handleUploadFile = async (file: File) => {
    if (!meetingId || !validateFile(file)) return;
    if (!window.confirm("음성 파일을 등록하시겠습니까?")) return;

    const tempSttId = selectedSttId;
    updateSttState(tempSttId, { isLoading: true, isTemp: false });
    
    try {
      const formData = new FormData();
      formData.append("file", file);
      await uploadSTT(meetingId, formData);
      const response = await getSTT(meetingId);
      const newStt = response.find(stt => !stts.some(oldStt => oldStt.id === stt.id)) || response[response.length - 1];
      
      await uploadContext(newStt.id, newStt.content);
      const finalStts = await getSTT(meetingId);

      setStts(finalStts.map(stt => ({...stt, recordingStatus: 'idle', recordingTime: 0, liveSttId: null})));
      setSelectedSttId(newStt.id);
    } catch (error) {
      console.error(error);
      alert("음성 파일 등록 중 오류가 발생했습니다.");
      setStts(prev => prev.filter(stt => stt.id !== tempSttId));
    }
  };

  const handleDelete = async (sttId: number) => {
    if (!window.confirm("음성 파일을 삭제하시겠습니까?")) return;
    try {
      await deleteSTT(sttId);
      setStts(prev => {
        const updated = prev.filter(stt => stt.id !== sttId);
        if (selectedSttId === sttId) {
          setSelectedSttId(updated[0]?.id ?? null);
        }
        return updated;
      });
      alert("음성 파일이 삭제되었습니다.");
    } catch (error) {
      console.error(error);
      alert("STT 삭제 중 오류가 발생했습니다.");
    }
  };

  const handleTabChange = (_event: unknown, newValue: SetStateAction<number | null>) => {
    handleSummarySave();
    setSelectedSttId(newValue);
  };
  
  const handleSummaryChange = (event: { target: { value: string; }; }) => {
    const newSummary = event.target.value;
    updateSttState(selectedSttId, { summary: newSummary });
  };

  const handleSummarySave = async () => {
    const currentStt = findSttById(selectedSttId);
    if (currentStt?.isEditable) {
      if (window.confirm('변경된 내용을 저장하시겠습니까?')) {
        await saveCurrentStt(currentStt.id, currentStt.summary);
      }
      updateSttState(selectedSttId, { isEditable: false });
    }
  }

  const addTempSttTab = () => {
    if(stts.some(stt => stt.isTemp || stt.isLoading)) return;
    if(!meetingId) return;
    const NEW_STT_ID = Date.now(); // Use a more unique temp ID
    const newTempStt: STTWithRecording = {
        id: NEW_STT_ID,
        meetingId: meetingId,
        content: "",
        summary: "",
        isEditable: false,
        isLoading: false,
        isTemp: true,
        recordingStatus: 'idle',
        recordingTime: 0,
        liveSttId: null,
      };
    
    setStts(prev => [...prev, newTempStt]);
    setSelectedSttId(NEW_STT_ID);
  }

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
  };

  const cleanupRecordingRefs = (sttId: number | null) => {
    if (sttId === null) return;
    mediaStreamRef.current[sttId]?.getTracks().forEach(track => track.stop());
    delete mediaRecorderRef.current[sttId];
    delete mediaStreamRef.current[sttId];
    if (timerIntervalRef.current[sttId]) {
      clearInterval(timerIntervalRef.current[sttId]);
      delete timerIntervalRef.current[sttId];
    }
  };

  const handleStartRecording = async (sttId: number | null) => {
    if (sttId === null || !meetingId) return;
  
    try {
      const { sttId: liveSttId } = await startRecording(meetingId);
      updateSttState(sttId, { liveSttId });

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current[sttId] = stream;
  
      const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      mediaRecorderRef.current[sttId] = recorder;
  
      recorder.ondataavailable = async (event) => {
        if (event.data.size > 0) {
          const chunk = new Blob([event.data], { type: 'audio/webm' });
          const formData = new FormData();
          formData.append("file", chunk, "chunk.webm");
          try {
            await uploadAudioChunk(liveSttId, formData);
            console.log(`Chunk for sttId ${liveSttId} uploaded successfully.`);
          } catch (e) {
            console.error("Chunk upload failed:", e);
            // NOTE: Here you might want to implement retry logic or notify the user.
          }
        }
      };
  
      recorder.onstop = async () => {
        updateSttState(sttId, { isLoading: true, recordingStatus: 'idle' });
        try {
          const finalStt = await finishRecording(liveSttId);
          setStts(prev => {
            const otherStts = prev.filter(s => s.id !== sttId);
            return [...otherStts, {...finalStt, recordingStatus: 'idle', recordingTime: 0, liveSttId: null}];
          });
          setSelectedSttId(finalStt.id);
        } catch(e) {
          console.error(e);
          alert("STT 변환에 실패했습니다.");
          setStts(prev => prev.filter(s => s.id !== sttId));
        } finally {
          cleanupRecordingRefs(sttId);
        }
      };
      
      recorder.start(600000); // 10-minute chunks
      updateSttState(sttId, { recordingStatus: 'recording', recordingTime: 0 });
  
      const timer = window.setInterval(() => {
        updateSttState(sttId, { recordingTime: findSttById(sttId)!.recordingTime! + 1 });
      }, 1000);
      timerIntervalRef.current[sttId] = timer;
  
    } catch (error) {
      console.error("Recording failed to start:", error);
      alert("녹음을 시작할 수 없습니다. 마이크 권한을 확인해주세요.");
      updateSttState(sttId, { recordingStatus: 'idle' });
    }
  };

  const handlePauseRecording = (sttId: number | null) => {
    if (sttId === null || !mediaRecorderRef.current[sttId]) return;
    mediaRecorderRef.current[sttId].pause();
    if (timerIntervalRef.current[sttId]) {
      clearInterval(timerIntervalRef.current[sttId]);
    }
    updateSttState(sttId, { recordingStatus: 'paused' });
  };
  
  const handleResumeRecording = (sttId: number | null) => {
    if (sttId === null || !mediaRecorderRef.current[sttId]) return;
    mediaRecorderRef.current[sttId].resume();
    const timer = window.setInterval(() => {
        updateSttState(sttId, { recordingTime: findSttById(sttId)!.recordingTime! + 1 });
    }, 1000);
    timerIntervalRef.current[sttId] = timer;
    updateSttState(sttId, { recordingStatus: 'recording' });
  };
  
  const handleStopRecording = (sttId: number | null) => {
    if (sttId === null || !mediaRecorderRef.current[sttId]) return;
    mediaRecorderRef.current[sttId].stop();
    // onstop handler will do the final processing and cleanup
  };

  return (
    <>
      <Typography fontWeight={600} mb={1}>
        음성 파일 변환
        <Button variant="outlined" onClick={addTempSttTab} sx={{ minWidth: 40, marginLeft: '10px' }}>
          +
        </Button>
      </Typography>
      
      <Box display="flex" alignItems="center" mb={1} gap={1}>
        <Tabs
          value={selectedSttId}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            '& .MuiTab-root': {
              transition: 'all 0.1s ease', position: 'relative', backgroundColor: 'rgba(0,0,0,0.05)',
              borderRadius: '5px', margin: '0 4px', padding: '0 12px',
              '&:not(:first-of-type)::before': {
                content: '""', position: 'absolute', left: '-2px', top: '20%',
                height: '60%', width: '1px', backgroundColor: 'rgba(0,0,0,0.12)', zIndex: 2,
              },
            },
            '& .Mui-selected': {
              backgroundColor: 'white', boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              fontWeight: "bold", color: 'primary.main',
            },
            maxWidth: '1000px',
            '& .MuiTabs-flexContainer': { justifyContent: 'flex-start', gap: '4px' },
          }}
        >
          {stts.map((stt) => (
            <Tab
              key={stt.id}
              value={stt.id}
              sx={{ paddingRight: '8px' }}
              label={
                <Box sx={{ display: "flex", alignItems: "center", textTransform: 'none' }}>
                  {stt.recordingStatus === 'recording' && (
                    <Box sx={{ display: 'flex', alignItems: 'center', mr: 1 }}>
                      <Box component="span" sx={{
                          width: 8, height: 8, borderRadius: '50%', bgcolor: 'red', mr: 0.8,
                          '@keyframes heartbeat': {
                            '0%': { transform: 'scale(0.8)', boxShadow: '0 0 0 0 rgba(255, 82, 82, 0.7)' },
                            '70%': { transform: 'scale(1)', boxShadow: '0 0 0 8px rgba(255, 82, 82, 0)' },
                            '100%': { transform: 'scale(0.8)', boxShadow: '0 0 0 0 rgba(255, 82, 82, 0)' }
                          },
                          animation: 'heartbeat 1.5s infinite'
                        }}
                      />
                      <Typography variant="caption" sx={{ color: 'red', fontWeight: 'bold' }}>Live</Typography>
                    </Box>
                  )}
                  {stt.isTemp ? "New Tab" : `Tab ${stts.filter(s => !s.isTemp).findIndex(s => s.id === stt.id) + 1}`}
                  <IconButton size="small"
                    disabled={stt.recordingStatus === 'recording' || stt.recordingStatus === 'paused'}
                    onClick={(e) => { e.stopPropagation(); handleDelete(stt.id); }}
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
        {findSttById(selectedSttId)?.isLoading && (
          <div className="absolute inset-0 bg-black/20 backdrop-blur-none z-40 flex items-center justify-center rounded-lg">
            <div className="bg-white/50 p-6 rounded-xl shadow-2xl flex flex-col items-center gap-3">
              <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin"></div>
               <Typography>음성 파일을 처리하고 있습니다...</Typography>
            </div>
          </div>
        )}

        {findSttById(selectedSttId)?.isTemp ? (
          (() => {
            const currentStt = findSttById(selectedSttId);
            if (currentStt?.recordingStatus === 'recording' || currentStt?.recordingStatus === 'paused') {
              return (
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', p: 3, border: '2px dashed #d0d0d0', borderRadius: 2, minHeight: 300 }}>
                  <Typography variant="h4" sx={{ mb: 2, fontFamily: 'monospace' }}>
                    {formatTime(currentStt.recordingTime || 0)}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    {currentStt.recordingStatus === 'recording' ? (
                      <Tooltip title="일시정지"><IconButton size="large" onClick={() => handlePauseRecording(selectedSttId)}><PauseCircleIcon sx={{ fontSize: 40 }} /></IconButton></Tooltip>
                    ) : (
                      <Tooltip title="다시 시작"><IconButton size="large" onClick={() => handleResumeRecording(selectedSttId)}><PlayCircleIcon sx={{ fontSize: 40 }} /></IconButton></Tooltip>
                    )}
                    <Tooltip title="종료"><IconButton size="large" color="error" onClick={() => handleStopRecording(selectedSttId)}><StopCircleIcon sx={{ fontSize: 40 }} /></IconButton></Tooltip>
                  </Box>
                </Box>
              );
            } else {
              return (
                <Box sx={{ mb: 3 }}>
                  <Typography sx={{ fontWeight: 600, fontSize: "0.875rem", mb: 1 }}>첨부 파일</Typography>
                  <input type="file" multiple id="fileUpload" style={{ display: "none" }} onChange={handleFileSelect} />
                  <Box
                    sx={{ border: isDragOver ? "3px dashed #007bff" : "2px dashed #d0d0d0", borderRadius: 2, p: 3, textAlign: "center", cursor: "pointer", transition: "all 0.2s ease", bgcolor: isDragOver ? "#e3f2fd" : "transparent", "&:hover": { bgcolor: "#fafafa", borderColor: "#999" } }}
                    onClick={openFileInput} onDrop={handleDrop} onDragOver={handleDragOver} onDragEnter={handleDragEnter} onDragLeave={handleDragLeave}
                  >
                    <UploadFileIcon sx={{ fontSize: 48, color: "#9e9e9e", mb: 1 }} />
                    <Typography sx={{ fontSize: "0.875rem", fontWeight: 500, mb: 0.5 }}>Choose files or Drag and Drop</Typography>
                    <Typography sx={{ fontSize: "0.875rem", fontWeight: 500, mb: 0.5 }}>최대 파일 크기: 2GB</Typography>
                    <Typography sx={{ fontSize: "0.875rem", fontWeight: 500, mb: 0.5 }}>허용 확장자: {allowedExtensions?.join(", ")}</Typography>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', my: 2 }}>
                    <Box sx={{ flexGrow: 1, height: '1px', bgcolor: 'divider' }} />
                    <Typography sx={{ mx: 2, color: 'text.secondary' }}>OR</Typography>
                    <Box sx={{ flexGrow: 1, height: '1px', bgcolor: 'divider' }} />
                  </Box>

                  <Box sx={{ textAlign: 'center' }}>
                    <Tooltip title="즉시 녹음 시작">
                      <IconButton color="primary" sx={{ border: '1px solid', p: 2 }} onClick={() => handleStartRecording(selectedSttId)}>
                        <MicIcon sx={{ fontSize: 40 }} />
                      </IconButton>
                    </Tooltip>
                    <Typography sx={{ mt: 1, fontSize: '0.875rem', fontWeight: 500 }}>녹음 시작</Typography>
                  </Box>
                </Box>
              )
            }
          })()
        ) : (stts.length > 0 && findSttById(selectedSttId)) ? (
        <Box>
          <Box sx={{ display: "flex", gap: 2, alignItems: "start", mt: 3 }}>
            <Box sx={{ flex: 1 }}>
              <Typography>
                요약 결과
                <Tooltip title={findSttById(selectedSttId)?.isEditable ? "저장" : "수정"} placement="top">
                  <IconButton size="small" sx={{ color: 'primary.main' }} disabled={findSttById(selectedSttId)?.isLoading}
                    onClick={() => {
                        const stt = findSttById(selectedSttId);
                        if (stt?.isEditable) {
                            handleSummarySave();
                        } else {
                            updateSttState(selectedSttId, { isEditable: true });
                        }
                    }}
                  >
                    {findSttById(selectedSttId)?.isEditable ? <SaveIcon /> : <EditIcon />}
                  </IconButton>
                </Tooltip>
              </Typography>
              <TextField fullWidth multiline rows={10}
                value={findSttById(selectedSttId)?.isLoading ? "요약 생성 중..." : findSttById(selectedSttId)?.summary ?? "텍스트 없음"}
                onChange={handleSummaryChange}
                sx={{ mt: 1, mb: 2, "& .MuiOutlinedInput-root": { borderRadius: 1.5, bgcolor: findSttById(selectedSttId)?.isLoading ? "#f0f0f0" : "#fafafa" }, "& .MuiInputBase-input.Mui-disabled": { WebkitTextFillColor: "#000000", color: "#000000" } }}
                disabled={!findSttById(selectedSttId)?.isEditable}
              />
              <Typography>회의 내용</Typography>
              <TextField fullWidth multiline rows={15}
                value={findSttById(selectedSttId)?.isLoading ? "음성 파일 변환 중..." : findSttById(selectedSttId)?.content ?? "텍스트 없음"}
                sx={{ mt: 1, mb: 2, "& .MuiOutlinedInput-root": { borderRadius: 1.5, bgcolor: "#fafafa" }, "& .MuiInputBase-input.Mui-disabled": { WebkitTextFillColor: "#000000", color: "#000000" } }}
                disabled
              />
            </Box>
          </Box>
        </Box>
        ) : <></>}
      </div>
    </>
  );
}
