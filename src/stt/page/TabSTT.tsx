import { useCallback, useEffect, useRef, useState, type SetStateAction } from "react";
import { getSTT, getSTTs, updateSummary, uploadSTT } from "../api/sttApi";
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
import { BASE_URL } from "../../config/httpClient";
import { GridDownloadIcon } from "@mui/x-data-grid";
import AudioPlayer from "../component/AudioPlayer";
import { useAuthStore } from "../../store/useAuthStore";
import type { MeetingDto } from "../../meeting/type/type";
import useRecordingStore, { type RecordingStatus } from "../../store/useRecordingStore";
import MarkdownText from "../component/MarkdownText";

export interface STTWithRecording extends STT {
  recordingStatus?: RecordingStatus;
  recordingTime?: number;
}

type TabSTTProp = {
  meeting: MeetingDto;
  fetchMeetingDetail: (meetingId: string) => void;
}

//daglo 최대 업로드 용량, 허용 확장자
const chunkingRate = 10;
const maxFileSize = 2 * 1024 * 1024 * 1024; // 2GB
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

export default function TabSTT({
  meeting, 
  fetchMeetingDetail
}: TabSTTProp) {
  const { meetingId } = useParams();  
  const { member } = useAuthStore();
  const role = member?.role;

  const { 
    stt: recordingStt, 
    recordingStatus, 
    recordingTime,
    startRecording,
    pauseRecording,
    resumeRecording,
    stopRecording,
    confirmUpload,
    cancelRecording,
    isRecording,
  } = useRecordingStore();
  const isCurrentlyRecording = isRecording();
  
  const [stts, setStts] = useState<STTWithRecording[]>([]);
  const [selectedSttId, setSelectedSttId] = useState<number | null>(null);
  const sttPollingIntervalRef = useRef<Map<number, number>>(new Map());
  const deletingIds = useRef<Set<number>>(new Set());

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleError = (error: unknown, msg: string) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) return;
    alert(msg);
  };
  
  {/* STT */}
  const startSttPolling = (sttId: number, pollingRate: number) => {
    if(!meetingId) return;
    sttPollingIntervalRef.current.set(sttId, setInterval( async () => {
      try{
        const res = await getSTT(sttId);
        updateSttState(sttId, {
          content: res.content,
          summary: res.summary,
          status: res.status,
          progress: res.progress,
        })
        if(res.status === "COMPLETED") {
          stopSttPolling(sttId);
          console.log('stt Interval cleared')
          updateSttState(sttId, { 
            content: res.content,
            summary: res.summary,
            status: res.status,
            progress: res.progress,
            isLoading: false,
          })
          fetchMeetingDetail(meetingId)
        }
      }catch(error) {
        handleError(error, "회의 내용을 불러오는데 실패했습니다.");
        stopSttPolling(sttId);
      }
    }, pollingRate));
  }

  const stopSttPolling = (sttId: number) => {
    const intervalId = sttPollingIntervalRef.current.get(sttId);
    if (intervalId) {
      clearInterval(intervalId);
      sttPollingIntervalRef.current.delete(sttId);
    }
  };

  const findSttById = (sttId: number | null): STTWithRecording | null => stts.find(s => s.id === sttId) ?? null;

  const updateSttState = (sttId: number | null, newProps: Partial<STTWithRecording>) => {
    if (sttId === null) return;
    setStts(prevStts =>
      prevStts.map(stt =>
        stt.id === sttId ? { 
          ...stt, 
          ...newProps 
        } : stt
      )
    );
  };
  
  useEffect(() => {
    if (!meetingId) return;
    const fetch = async () => {
      try {
        const response = await getSTTs(meetingId);
        setStts(response.map(stt => {
            if(stt.status === "PROCESSING" || stt.status === "SUMMARIZING") {
              startSttPolling(stt.id, 2000);
              return {
                ...stt,
                isLoading: true,
              }
            } 
            return { ...stt }
        }));
        if (response.length !== 0) setSelectedSttId(response[response.length-1].id);
        setSelectedSttId((prev) => {
          if (prev && response.some((stt) => stt.id === prev)) return prev; 
          return response[response.length-1]?.id ?? null;
        });
      } catch (error) {
        handleError(error, "회의 내용을 불러오는데 실패했습니다.");
      }
    };
    fetch();
  }, [meetingId]);

  const handleDelete = async (sttId: number) => {
    if (!sttId || !meetingId || deletingIds.current.has(sttId)) return;
    const isTemp = findSttById(sttId)?.isTemp;
    if(!isTemp && !window.confirm("선택한 회의 내용을 삭제하시겠습니까?")) return;
    setStts((prev) => {
      if (!prev.some(stt => stt.id === sttId)) return prev;
      const sttToDelete = prev.find(stt => stt.id === sttId);
      if (!sttToDelete || sttToDelete.id === recordingStt?.id && isCurrentlyRecording) {
        return prev;
      }
      deletingIds.current.add(sttId);
      stopSttPolling(sttId);
      const current = prev.filter(stt => stt.id !== sttId);
      setSelectedSttId(current.length === 0 ? null : current[current.length-1].id);
      return current;
    });
    if(isTemp) return;
    
    try {
      await cancelRecording(sttId);
      if (!sttId) alert("회의 내용이 삭제되었습니다.");
    } catch (error) {
      handleError(error, "삭제 중 오류가 발생했습니다.");
    } finally {
      fetchMeetingDetail(meetingId);
      deletingIds.current.delete(sttId);
    }
  }

  {/* Recording */}
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
  };

  const handleStartRecording = async () => {
    if (!meetingId) return;
    if (isCurrentlyRecording) {
      alert("다른 녹음이 진행 중입니다.");
      return;
    }

    try {
      await startRecording(meetingId, (newStt: STT) => {
        const newSttEntry: STTWithRecording = {
          ...newStt,
          isTemp: true,
          recordingStatus: 'recording',
          recordingTime: 0,
        };
        setStts(prev => [...prev.filter(s => s.id !== selectedSttId), newSttEntry]);
        setSelectedSttId(newStt.id);
      });
    }catch(error) {
      handleError(error, "녹음을 시작할 수 없습니다.");
    }
  };

  const handleConfirmUpload = async (sttId: number | null) => {
    if (!sttId || !window.confirm("음성 파일을 등록하시겠습니까?")) return;

    updateSttState(sttId, {
      isLoading: true,
      isTemp: false,
    });
    try{
      const newStt = await confirmUpload(sttId);
      if (newStt) {
        updateSttState(sttId, {
          ...newStt,
          isEditable: false,
          isLoading: true,
          isTemp: false,
          recordingStatus: 'idle',
          recordingTime: 0,
        });
        setSelectedSttId(newStt.id);
        startSttPolling(newStt.id, 2000);
      }
    }catch(error) {
      handleError(error, "음성 변환에 실패했습니다.");
      updateSttState(sttId, { 
        isLoading: false, 
        status: "RECORDING" 
      });
    }
  };
  
  const assumeDuration = (cnt: number) => {
    const min = Math.floor(cnt*chunkingRate/60);
    if(min < 1) return "1분 미만 녹음 파일"
    return `약 ${min}분 녹음 파일`
  }

  useEffect(() => {
    if (recordingStt) {
      if (!stts.some(s => s.id === recordingStt.id)) {
        const newSttEntry: STTWithRecording = {
          ...recordingStt,
          isTemp: true, 
          recordingStatus: recordingStatus,
          recordingTime: recordingTime,
        };
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setStts(prev => [...prev, newSttEntry]);
        setSelectedSttId(newSttEntry.id);
      } else {
        updateSttState(recordingStt.id, {
          recordingStatus: recordingStatus,
          recordingTime: recordingTime,
        });
      }
    }
  }, [recordingStt, recordingStatus, recordingTime]);

  {/* File */}
  const openFileInput = () => {
    fileInputRef.current?.click();
  };

  const validateFile = (file: File): boolean => {
    const ext = file.name.split(".").pop()?.toLowerCase();
    if (!ext || !allowedExtensions.includes(ext)) {
      alert(`허용되지 않은 파일 형식입니다: ${file.name}`);
      return false;
    }
    if (file.size > maxFileSize) {
      const sizeGB = (file.size / 1024 / 1024 / 1024).toFixed(2);
      alert(`파일 크기가 2GB를 초과했습니다. (현재: ${sizeGB}GB)`);
      return false;
    }
    return true;
  };
  
  const handleUploadFile = async (file: File) => {
    if (!meetingId 
      || !validateFile(file) 
      || !window.confirm("음성 파일을 등록하시겠습니까?")
    ) return;

    updateSttState(selectedSttId, {
      isLoading: true,
      isTemp: false,
    });
    try {
      const formData = new FormData();
      formData.append("file", file);
      const newStt = await uploadSTT(meetingId, formData);
      updateSttState(selectedSttId, {
        id: newStt.id, 
        status: newStt.status,
        file: newStt.file,
        isLoading: true, 
        isTemp: false 
      })
      setSelectedSttId(newStt.id);
      startSttPolling(newStt.id, 2000);
    } catch (error) {
      handleError(error, "음성 파일 등록 중 오류가 발생했습니다.");
      updateSttState(selectedSttId, {
        isLoading: false,
        isTemp: true,
      });
    }
  };
  
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    handleUploadFile(file);
    e.target.value = "";
  };

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

  {/* Summary */}
  const handleSummaryChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newSummary = event.target.value;
    updateSttState(selectedSttId, { summary: newSummary });
  };

  const handleSummarySave = async () => {
    if(!meetingId) return;
    const currentStt = findSttById(selectedSttId);
    if (!currentStt?.isEditable || !window.confirm('변경된 내용을 저장하시겠습니까?')) return;

    try{
      await updateSummary(currentStt.id, currentStt.summary);
      updateSttState(selectedSttId, { isEditable: false });
      fetchMeetingDetail(meetingId);
    }catch(error) {
      handleError(error, "회의 요약 수정중 오류가 발생했습니다.");
    }
  }

  {/* Tabs */}
  const addTempSttTab = () => {
    if(!meetingId) return;
    
    const NEW_STT_ID = Date.now();
    const newTempStt: STTWithRecording = {
      id: NEW_STT_ID,
      meetingId: meetingId,
      memberId: member!.memberId,
      content: "",
      summary: "",
      isEditable: false,
      isLoading: false,
      isTemp: true,
      recordingStatus: 'idle',
      recordingTime: 0,
    };
    setStts(prev => [...prev, newTempStt]);
    setSelectedSttId(NEW_STT_ID);
  }

  const handleTabChange = async (_event: unknown, newValue: SetStateAction<number | null>) => {
    handleSummarySave();
    setSelectedSttId(newValue);
  };
  
  return (
    <>
      {/* STT 제목 */}
      <Typography fontWeight={600} mb={1}>
        음성 파일 변환
        {((meeting.isEditPermitted && meeting.status !== "COMPLETED") ||
          role === "ADMIN") &&
          meeting.isDel === false && (
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
        )}
      </Typography>
      

      {/* stt 헤더 바 */}
      <Box display="flex" alignItems="center" mb={1} gap={1}>
        {/* STT 버튼들 */}
        <Tabs
          value={selectedSttId}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            maxWidth: '800px',
            '& .MuiTab-root': {
              transition: 'all 0.1s ease',
              position: 'relative',
              backgroundColor: 'rgba(0,0,0,0.05)',
              borderRadius: '5px',
              margin: '0 4px',
              padding: '0 12px',
            }
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
                  {(stt.id === recordingStt?.id && (recordingStatus === 'recording' || recordingStatus === 'paused')) && (
                    <Box sx={{ display: 'flex', alignItems: 'center', mr: 1 }}>
                      <Box 
                        component="span"
                        sx={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          bgcolor: 'red',
                          mr: 0.8,
                          '@keyframes heartbeat': {
                            '0%': { transform: 'scale(0.8)', boxShadow: '0 0 0 0 rgba(255, 82, 82, 0.7)' },
                            '70%': { transform: 'scale(1)', boxShadow: '0 0 0 8px rgba(255, 82, 82, 0)' },
                            '100%': { transform: 'scale(0.8)', boxShadow: '0 0 0 0 rgba(255, 82, 82, 0)' }
                          },
                          animation: recordingStatus === 'recording' ? 'heartbeat 1.5s infinite' : 'none'
                        }}
                      />
                      <Typography variant="caption" sx={{ color: 'red', fontWeight: 'bold' }}>Live</Typography>
                    </Box>
                  )}
                  {stt.isTemp ? "New Tab" : "Tab " + (index+1)}
                  {((meeting.isEditPermitted && meeting.status !== "COMPLETED") ||
                    role === "ADMIN") &&
                    meeting.isDel === false && (
                    <IconButton
                      size="small"
                      disabled={stt.id === recordingStt?.id && isCurrentlyRecording}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(stt.id);
                      }}
                    >
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  )}
                </Box>
              }
            />
          ))}
        </Tabs>
      </Box>
      
      <div className="relative p-3">
        {findSttById(selectedSttId)?.isLoading && !findSttById(selectedSttId)?.isTemp ? (
          <div className="absolute inset-0 bg-black/10 backdrop-blur-none z-40 flex items-center justify-center rounded-lg">
            <div className="bg-white/50 px-6 py-3 rounded-xl shadow-2xl flex flex-col items-center gap-1">
              <div className="w-10 h-10 mb-1 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin">
              </div>
              {findSttById(selectedSttId)?.status === "PROCESSING" &&
              <Typography padding={0} margin={0}>변환중..</Typography>
              }
              {findSttById(selectedSttId)?.status === "SUMMARIZING" &&
              <Typography padding={0} margin={0}>요약중..</Typography>
              }
              <Typography>{`${findSttById(selectedSttId)?.progress ?? 0}%`}</Typography>
            </div>
          </div>
        ) : <></>}
        {
          (() => {
            const currentStt = findSttById(selectedSttId);
            if (!currentStt) return (
              (stts.length === 0) ? (
              <Box sx={{ textAlign: "center", color: "text.disabled", my: 2 }}>
                등록된 회의 내용이 없습니다.
              </Box>) : <></>
            );

            const isThisSttRecording = currentStt.id === recordingStt?.id;
            const currentRecordingStatus = isThisSttRecording ? recordingStatus : currentStt.recordingStatus;
            const currentRecordingTime = isThisSttRecording ? recordingTime : (currentStt.recordingTime || 0);

            if (currentRecordingStatus === 'recording' || currentRecordingStatus === 'paused') {
              return (
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', p: 3, border: '2px dashed #d0d0d0', borderRadius: 2, minHeight: 300 }}>
                  <Typography variant="h4" sx={{ mb: 2, fontFamily: 'monospace' }}>
                    {formatTime(currentRecordingTime)}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    {currentRecordingStatus === 'recording' ? (
                      <Tooltip title="일시정지">
                        <IconButton size="large" onClick={pauseRecording}>
                          <PauseCircleIcon sx={{ fontSize: 40 }} />
                        </IconButton>
                      </Tooltip>
                    ) : (
                      <Tooltip title="다시 시작">
                        <IconButton size="large" onClick={resumeRecording}>
                          <PlayCircleIcon sx={{ fontSize: 40 }} />
                        </IconButton>
                      </Tooltip>
                    )}
                    <Tooltip title="종료">
                      <IconButton size="large" color="error" onClick={stopRecording}>
                        <StopCircleIcon sx={{ fontSize: 40 }} />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>
              );
            } else if (currentStt.status === "RECORDING") {
              return (
                <Box sx={{ p: 3, border: '2px dashed #d0d0d0', borderRadius: 2, textAlign: 'center' }}>
                    {(currentStt.recordingTime ?? 0) === 0 && (
                      <Typography variant="h6" sx={{ mb: 2 }}>{assumeDuration(currentStt.chunkingCnt || 0)}</Typography>
                    )}
                    <AudioPlayer stts={stts} sttId={selectedSttId} />
                    <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center', gap: 2 }}>
                        <Button 
                          variant="contained" 
                          color="primary" 
                          disabled={currentRecordingStatus === "encoding"}
                          onClick={() => handleConfirmUpload(selectedSttId)}
                        >
                          {currentRecordingStatus === "encoding" ? "인코딩중.." : "음성 변환 시작"}
                        </Button>
                        <Button variant="outlined" color="secondary" onClick={() => handleDelete(currentStt.id)}>취소</Button>
                    </Box>
                </Box>
              );
            } else if (currentStt.isTemp) {
              return (
                <Box sx={{ mb: 3 }}>
                  <Typography sx={{ fontWeight: 600, fontSize: "0.875rem", mb: 1 }}>첨부 파일</Typography>
                  <input ref={fileInputRef} type="file" multiple id="fileUpload" style={{ display: "none" }} onChange={handleFileSelect} />
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
                      <IconButton color="primary" sx={{ border: '1px solid', p: 2 }} onClick={handleStartRecording} disabled={isCurrentlyRecording}>
                        <MicIcon sx={{ fontSize: 40 }} />
                      </IconButton>
                    </Tooltip>
                    <Typography sx={{ mt: 1, fontSize: '0.875rem', fontWeight: 500 }}>녹음 시작</Typography>
                  </Box>
                </Box>
              )
            } else {
              return (
                <Box>
                  <Box sx={{ display: "flex", gap: 2, alignItems: "start" }}>
                    <Box sx={{ flex: 1 }}>
                      <Box sx={{ px: 2, pt: 2, mb: 2, bgcolor: "#fafafa", borderRadius: 1.5, "&::-webkit-scrollbar": { width: 6 }, "&::-webkit-scrollbar-thumb": { backgroundColor: "#ccc", borderRadius: 3 } }}>
                        <Box key={currentStt.file?.fileId} sx={{ display: "grid", gridTemplateColumns: "1fr 85px 120px 35px", alignItems: "center" }}>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                            <Box sx={{ width: 32, height: 32, bgcolor: 'gray', borderRadius: 1, display: "flex", justifyContent: "center", alignItems: "center", color: "#fff", fontSize: "0.7rem", fontWeight: 700, flexShrink: 0 }}>
                              <PlayCircleIcon fontSize="small" /> 
                            </Box>
                            <Typography fontSize="small" component="a" href={`${BASE_URL}${currentStt.file?.path}`} download={currentStt.file?.originalName}>
                              {currentStt.file?.originalName}
                            </Typography>
                          </Box>
                          <Typography sx={{ color: "text.secondary" }} fontSize="0.9rem">{currentStt.file?.size}</Typography>
                          <Typography sx={{ color: "text.secondary" }} fontSize="0.9rem">{currentStt.file?.createdAt}</Typography>
                          <IconButton size="small" component="a" href={`${BASE_URL}${currentStt.file?.path}`} download={currentStt.file?.originalName}>
                            <GridDownloadIcon fontSize="small" />
                          </IconButton>
                        </Box>
                        <AudioPlayer stts={stts} sttId={selectedSttId} />
                      </Box>
                      <Typography fontWeight="bold" fontSize="1.2rem">
                        요약 결과
                        {((meeting.isEditPermitted && meeting.status !== "COMPLETED") ||
                          role === "ADMIN") &&(
                          <Tooltip title={currentStt.isEditable ? "저장" : "수정"} placement="top">
                            <IconButton size="small" sx={{ color: 'primary.main' }} disabled={currentStt.isLoading}>
                              {currentStt.isEditable ? <SaveIcon onClick={handleSummarySave} /> : <EditIcon onClick={() => updateSttState(selectedSttId, { isEditable: true })} />}
                            </IconButton>
                          </Tooltip>
                        )}
                      </Typography>
                      
                      {currentStt.isEditable ? (
                        <TextField
                          fullWidth multiline rows={10}
                          value={currentStt.summary}
                          onChange={handleSummaryChange}
                          sx={{ mt: 1, mb: 2, "& .MuiOutlinedInput-root": { borderRadius: 1.5, bgcolor: "#fafafa" } }}
                        />
                      ) : (
                        <Box
                          sx={{
                            mt: 1,
                            mb: 2,
                            p: 2,
                            borderRadius: 1.5,
                            bgcolor: "#fafafa",
                            minHeight: 300,
                            maxHeight: 500,
                            overflow: 'auto',
                            border: '1px solid',
                            borderColor: 'divider',
                          }}
                        >
                          <MarkdownText 
                          content={currentStt.summary}
                          />
                        </Box>
                      )}
                      
                      <Typography fontWeight="bold" fontSize="1.2rem">
                        회의 내용
                      </Typography>
                      <Box
                          sx={{
                            mt: 1,
                            p: 2,
                            borderRadius: 1.5,
                            bgcolor: "#fafafa",
                            minHeight: 300,
                            maxHeight: 500,
                            overflow: 'auto',
                            border: '1px solid',
                            borderColor: 'divider',
                          }}
                        >
                        <MarkdownText
                        content={currentStt.content}
                        />
                      </Box>
                    </Box>
                  </Box>
                </Box>
              )
            }
          })()
        }
      </div>
    </>
  );
}
