import { useEffect, useRef, useState, useCallback } from "react";
import {
  deleteSTT,
  getSTT,
  getSTTs,
  updateSummary,
  uploadSTT,
} from "../api/sttApi";
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
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import { useParams } from "react-router-dom";
import type { STT } from "../type/type";
import { BASE_URL } from "../../config/httpClient";
import { GridDownloadIcon } from "@mui/x-data-grid";
import { useAuthStore } from "../../store/useAuthStore";
import type { MeetingDto } from "../../meeting/type/type";
import useRecordingStore, {
  type RecordingStatus,
} from "../../store/useRecordingStore";
import MarkdownText from "../component/MarkdownText";
import RecordingTimer from "../component/RecordingTimer";
import Spinner from "../component/Spinner";
import axios from "axios";
import useWebSocketStore from "../../store/useWebSocketStore";

export interface STTWithRecording extends STT {
  recordingStatus?: RecordingStatus;
}

type TabSTTProp = {
  meeting: MeetingDto;
  fetchMeetingDetail: (meetingId: string) => void;
};

//daglo 최대 업로드 용량, 허용 확장자
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

export default function TabSTT({ meeting, fetchMeetingDetail }: TabSTTProp) {
  const { meetingId } = useParams();
  const { member } = useAuthStore();
  const role = member?.role;

  const startRecording = useRecordingStore((state) => state.startRecording);
  const pauseRecording = useRecordingStore((state) => state.pauseRecording);
  const resumeRecording = useRecordingStore((state) => state.resumeRecording);
  const stopRecording = useRecordingStore((state) => state.stopRecording);
  const confirmUpload = useRecordingStore((state) => state.confirmUpload);
  const cancelRecording = useRecordingStore((state) => state.cancelRecording);
  const isAnyRecordingActive = useRecordingStore(
    (state) => state.isAnyRecordingActive
  );
  const getSessionState = useRecordingStore((state) => state.getSessionState);

  const [stts, setStts] = useState<STTWithRecording[]>([]);
  const [selectedSttId, setSelectedSttId] = useState<number | null>(null);
  const deletingIds = useRef<Set<number>>(new Set());

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isStartingRecording, setIsStartingRecording] = useState(false);
  const [isStoppingRecording, setIsStoppingRecording] = useState(false);
  const [isStartingProcessing, setIsStartingProcessing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isFetchingStts, setIsFetchingStts] = useState(false);

  const handleError = (error: unknown, msg: string) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) return;
    alert(msg);
  };

  const validateAndPlayAudio = async (stt: STTWithRecording) => {
    if (!stt.file?.path) return;

    const audioUrl = `${BASE_URL}${stt.file.path}`;
    for (let i = 0; i < 3; i++) {
      try {
        const response = await fetch(audioUrl, { method: "HEAD" });
        if (response.ok) {
          console.log(`Audio file is ready to play. (Attempt ${i + 1})`);
          updateSttState(stt.id, { isPlayable: true });
          return;
        }
      } catch (e) {
        console.warn(
          `HEAD request for audio failed. Retrying... (Attempt ${i + 1})`,
          e
        );
      }
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
    console.error("Audio file could not be validated after multiple retries.");
    handleError(
      new Error("Audio validation failed"),
      "오디오 파일을 재생할 수 없습니다."
    );
  };

  const findSttById = useCallback((sttId: number | null): STTWithRecording | null =>
    stts.find((s) => s.id === sttId) ?? null, [stts]);

  const updateSttState = (
    sttId: number | null,
    newProps: Partial<STTWithRecording>
  ) => {
    if (sttId === null) return;
    setStts((prevStts) =>
      prevStts.map((stt) =>
        stt.id === sttId
          ? {
              ...stt,
              ...newProps,
            }
          : stt
      )
    );
  };

  useEffect(() => {
    if (!meetingId) return;

    let subscriptionId: string | null = null;
    const { connect, subscribe, unsubscribe, disconnect } = useWebSocketStore.getState();

    connect().then(() => {
      subscriptionId = subscribe<STT>(
        `/topic/stt/updates/${meetingId}`,
        (message) => {
          updateSttState(message.id, {
            ...message,
            isLoading: message.status !== "ENCODED",
            isTemp: false
          });
          if (message.status === "ENCODED") {
            validateAndPlayAudio(message);
          }
        }
      );
    });

    const fetchInitialStts = async () => {
      setIsFetchingStts(true);
      try {
        const response = await getSTTs(meetingId);
        const firstTabSttId = response[response.length - 1]?.id ?? null;
        const firstTabStt = response.find((stt) => stt.id === firstTabSttId);

        if (firstTabStt) {
          validateAndPlayAudio(firstTabStt);
        }

        setStts(
          response.map((stt) => ({
            ...stt,
            isLoading:
              stt.status === "PROCESSING" || stt.status === "SUMMARIZING" || stt.status === "ENCODING",
          }))
        );
        setSelectedSttId(firstTabSttId);
      } catch (error) {
        handleError(error, "회의 내용을 불러오는데 실패했습니다.");
      } finally {
        setIsFetchingStts(false);
      }
    };

    fetchInitialStts();

    return () => {
      if (subscriptionId) {
        unsubscribe(subscriptionId);
      }
      disconnect();
    };
  }, [meetingId]);

  const handleDelete = useCallback(
    async (sttId: number) => {
      if (!sttId || !meetingId || deletingIds.current.has(sttId)) return;

      const sessionState = getSessionState(sttId);
      const isThisSttRecording =
        sessionState?.recordingStatus === "recording" ||
        sessionState?.recordingStatus === "paused";

      if (isThisSttRecording) {
        if (!window.confirm("녹음이 진행 중입니다. 정말로 삭제하시겠습니까?"))
          return;
        await cancelRecording(sttId);
      } else {
        const sttToDelete = findSttById(sttId);
        if (
          !sttToDelete?.isTemp &&
          !window.confirm("선택한 회의 내용을 삭제하시겠습니까?")
        )
          return;
      }

      deletingIds.current.add(sttId);

      setStts((prev) => {
        const current = prev.filter((stt) => stt.id !== sttId);
        setSelectedSttId(
          current.length === 0 ? null : current[current.length - 1].id
        );
        return current;
      });

      const sttToDelete = findSttById(sttId);
      if (sttToDelete?.isTemp) {
        deletingIds.current.delete(sttId);
        return;
      }

      try {
        if (!isThisSttRecording) {
          await deleteSTT(sttId);
        }
        alert("회의 내용이 삭제되었습니다.");
      } catch (error) {
        handleError(error, "삭제 중 오류가 발생했습니다.");
        if (sttToDelete) {
          setStts((prev) => [...prev, sttToDelete]);
        }
      } finally {
        fetchMeetingDetail(meetingId);
        deletingIds.current.delete(sttId);
      }
    },
    [meetingId, getSessionState, cancelRecording, fetchMeetingDetail, findSttById]
  );

  {
    /* Recording */
  }
  const handleStartRecording = async () => {
    if (!meetingId) return;
    if (isAnyRecordingActive()) {
      alert("다른 녹음이 진행 중입니다.");
      return;
    }

    setIsStartingRecording(true);
    try {
      const newStt = await startRecording(meetingId);
      if (newStt) {
        const newSttEntry: STTWithRecording = {
          ...newStt,
          isTemp: true,
        };
        setStts((prev) => [
          ...prev.filter((s) => s.id !== selectedSttId),
          newSttEntry,
        ]);
        setSelectedSttId(newStt.id);
      }
    } catch (error) {
      handleError(error, "녹음을 시작할 수 없습니다.");
    } finally {
      setIsStartingRecording(false);
    }
  };

  const finishRecording = async (sttId: number) => {
    setIsStoppingRecording(true);
    try {
      await stopRecording(sttId);
      // State update will be handled by the websocket message
    } catch (e) {
      handleError(e, "녹음 종료에 실패했습니다.");
    } finally {
      setIsStoppingRecording(false);
    }
  };

  const handleConfirmUpload = async (sttId: number | null) => {
    if (!sttId || !window.confirm("음성 파일을 등록하시겠습니까?")) return;
    setIsStartingProcessing(true);
    updateSttState(sttId, {
      isLoading: true,
      isTemp: false,
    });
    try {
      await confirmUpload(sttId);
      // State update will be handled by the websocket message
    } catch (error) {
      handleError(error, "음성 변환에 실패했습니다.");
      updateSttState(sttId, {
        isLoading: false,
        status: "ENCODED",
      });
    } finally {
      setIsStartingProcessing(false);
    }
  };

  const isSttRecordingNow = (sttId: number | null): boolean => {
    if (sttId === null) return false;
    const state = getSessionState(sttId);
    return (
      state?.recordingStatus === "recording" ||
      state?.recordingStatus === "paused"
    );
  };

  {
    /* File */
  }
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
    if (
      !meetingId ||
      !validateFile(file) ||
      !window.confirm("음성 파일을 등록하시겠습니까?")
    )
      return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const newStt = await uploadSTT(meetingId, formData);

      setStts((prev) => [...prev, { ...newStt, isLoading: true }]);
      setSelectedSttId(newStt.id);
    } catch (error) {
      handleError(error, "음성 파일 등록 중 오류가 발생했습니다.");
    } finally {
      setIsUploading(false);
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

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) =>
    e.preventDefault();

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

  {
    /* Summary */
  }
  const handleSummaryChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newSummary = event.target.value;
    updateSttState(selectedSttId, { summary: newSummary });
  };

  const handleSummarySave = async () => {
    if (!meetingId) return;
    const currentStt = findSttById(selectedSttId);
    if (
      !currentStt?.isEditable ||
      !window.confirm("변경된 내용을 저장하시겠습니까?")
    )
      return;

    try {
      await updateSummary(currentStt.id, currentStt.summary);
      updateSttState(selectedSttId, { isEditable: false });
      fetchMeetingDetail(meetingId);
    } catch (error) {
      handleError(error, "회의 요약 수정중 오류가 발생했습니다.");
    }
  };

  {
    /* Tabs */
  }
  const addTempSttTab = () => {
    if (!meetingId) return;

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
      recordingStatus: "idle",
    };
    setStts((prev) => [...prev, newTempStt]);
    setSelectedSttId(NEW_STT_ID);
  };

  const handleTabChange = async (_event: unknown, newValue: number | null) => {
    handleSummarySave();
    setSelectedSttId(newValue);

    if (newValue === null) return;
    const newStt = findSttById(newValue);
    if (newStt && newStt.status === "ENCODED" && !newStt.isPlayable) {
      validateAndPlayAudio(newStt);
    }
  };

  const getLoadingMessage = () => {
    if (isFetchingStts) return "회의 내용을 불러오는 중...";
    if (isUploading) return "업로드 중...";
    if (isStartingRecording) return "녹음 세션 시작 중...";

    const currentStt = findSttById(selectedSttId);
    if (currentStt?.isLoading && !currentStt?.isTemp) {
      if (currentStt.status === "ENCODING") return "인코딩중..";
      if (currentStt.status === "PROCESSING")
        return `변환중.. ${currentStt.progress ?? 0}%`;
      if (currentStt.status === "SUMMARIZING")
        return `요약중.. ${currentStt.progress ?? 0}%`;
    }
    return undefined;
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
                marginLeft: "10px",
              }}
              disabled={isUploading || isStartingRecording}
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
            maxWidth: "800px",
            "& .MuiTab-root": {
              transition: "all 0.1s ease",
              position: "relative",
              backgroundColor: "rgba(0,0,0,0.05)",
              borderRadius: "5px",
              margin: "0 4px",
              padding: "0 12px",
            },
          }}
        >
          {stts.map((stt, index) => {
            const isThisSttRecording = isSttRecordingNow(stt.id);
            return (
              <Tab
                key={stt.id}
                value={stt.id}
                sx={{
                  paddingRight: "8px",
                }}
                label={
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      textTransform: "none",
                    }}
                  >
                    {isThisSttRecording && (
                      <Box
                        sx={{ display: "flex", alignItems: "center", mr: 1 }}
                      >
                        <Box
                          component="span"
                          sx={{
                            width: 8,
                            height: 8,
                            borderRadius: "50%",
                            bgcolor: "red",
                            mr: 0.8,
                            "@keyframes heartbeat": {
                              "0%": {
                                transform: "scale(0.8)",
                                boxShadow: "0 0 0 0 rgba(255, 82, 82, 0.7)",
                              },
                              "70%": {
                                transform: "scale(1)",
                                boxShadow: "0 0 0 8px rgba(255, 82, 82, 0)",
                              },
                              "100%": {
                                transform: "scale(0.8)",
                                boxShadow: "0 0 0 0 rgba(255, 82, 82, 0)",
                              },
                            },
                            animation: "heartbeat 1.5s infinite",
                          }}
                        />
                        <Typography
                          variant="caption"
                          sx={{ color: "red", fontWeight: "bold" }}
                        >
                          Live
                        </Typography>
                      </Box>
                    )}
                    {stt.isTemp ? "New Tab" : "Tab " + (index + 1)}
                    {((meeting.isEditPermitted &&
                      meeting.status !== "COMPLETED") ||
                      role === "ADMIN") &&
                      meeting.isDel === false && (
                        <IconButton
                          size="small"
                          disabled={isThisSttRecording}
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
            );
          })}
        </Tabs>
      </Box>

      <div className="relative p-3">
        {getLoadingMessage() && <Spinner message={getLoadingMessage()} />}
        {(() => {
          const currentStt = findSttById(selectedSttId);
          if (!currentStt)
            return (
              <Box
                sx={{
                  minWidth: 10,
                  minHeight: 10,
                  textAlign: "center",
                  color: "text.disabled",
                  my: 2,
                }}
              >
                등록된 회의 내용이 없습니다.
              </Box>
            );

          const sessionState = getSessionState(currentStt.id);
          const currentRecordingStatus =
            sessionState?.recordingStatus ??
            currentStt.recordingStatus ??
            "idle";

          if (
            currentRecordingStatus === "recording" ||
            currentRecordingStatus === "paused"
          ) {
            return (
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  p: 3,
                  border: "2px dashed #d0d0d0",
                  borderRadius: 2,
                  minHeight: 300,
                }}
              >
                <RecordingTimer sttId={currentStt.id} />
                <Box sx={{ display: "flex", gap: 2 }}>
                  {currentRecordingStatus === "recording" ? (
                    <Tooltip title="일시정지">
                      <IconButton
                        size="large"
                        onClick={() => pauseRecording(currentStt.id)}
                      >
                        <PauseCircleIcon sx={{ fontSize: 40 }} />
                      </IconButton>
                    </Tooltip>
                  ) : (
                    <Tooltip title="다시 시작">
                      <IconButton
                        size="large"
                        onClick={() => resumeRecording(currentStt.id)}
                      >
                        <PlayCircleIcon sx={{ fontSize: 40 }} />
                      </IconButton>
                    </Tooltip>
                  )}
                  <Tooltip title="종료">
                    <IconButton
                      size="large"
                      color="error"
                      onClick={() => finishRecording(currentStt.id)}
                    >
                      <StopCircleIcon sx={{ fontSize: 40 }} />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>
            );
          } else if (
            currentStt.status === "RECORDING" &&
            currentStt.memberId !== member?.memberId
          ) {
            return (
              <Box
                sx={{
                  p: 3,
                  border: "2px dashed #d0d0d0",
                  borderRadius: 2,
                  textAlign: "center",
                }}
              >
                <Typography variant="h6" sx={{ mb: 2 }}>
                  녹음 중
                </Typography>
                <Typography color="error" sx={{ my: 2 }}>
                  녹음 중인 회의가 있습니다.
                </Typography>
              </Box>
            );
          } else if (
            currentStt.status === "RECORDING" ||
            currentStt.status === "ENCODING" ||
            currentStt.status === "ENCODED"
          ) {
            return (
              <Box
                sx={{
                  p: 3,
                  border: "2px dashed #d0d0d0",
                  borderRadius: 2,
                  textAlign: "center",
                }}
              >
                <Typography variant="h6" sx={{ mb: 2 }}>
                  녹음 완료
                </Typography>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                    py: 1,
                    minHeight: "56px", // 오디오 플레이어 높이
                  }}
                >
                  {currentStt.isPlayable ? (
                    <audio
                      key={`${currentStt.id}-playable`}
                      className="w-full"
                      preload="metadata"
                      controls
                    >
                      <source
                        src={`${BASE_URL}${currentStt?.file?.path}?v=${currentStt?.file?.updatedAt}`}
                        type="audio/mpeg"
                      />
                    </audio>
                  ) : (
                    <Box
                      sx={{
                        width: "100%",
                        height: "30px",
                        backgroundColor: "grey.200",
                        borderRadius: "15px",
                        display: "flex",
                        alignItems: "center",
                        px: 2,
                      }}
                    >
                      <div className="w-4 h-4 border-2 border-gray-400 border-t-gray-600 rounded-full animate-spin"></div>
                      <Typography
                        variant="caption"
                        sx={{ ml: 1, color: "grey.600" }}
                      >
                        오디오 최적화 중...
                      </Typography>
                    </Box>
                  )}
                </Box>
                <Box
                  sx={{
                    mt: 3,
                    display: "flex",
                    justifyContent: "center",
                    gap: 2,
                  }}
                >
                  <Button
                    variant="contained"
                    color="primary"
                    disabled={
                      currentStt.isLoading ||
                      isStoppingRecording ||
                      isStartingProcessing
                    }
                    onClick={() => handleConfirmUpload(selectedSttId)}
                  >
                    {isStoppingRecording ? "인코딩 요청 중..." : "음성 변환"}
                  </Button>
                  <Button
                    variant="outlined"
                    color="secondary"
                    disabled={currentStt.isLoading}
                    onClick={() => handleDelete(currentStt.id)}
                  >
                    취소
                  </Button>
                </Box>
              </Box>
            );
          } else if (currentStt.isTemp) {
            return (
              <Box sx={{ position: "relative", mb: 3 }}>
                <Typography
                  sx={{ fontWeight: 600, fontSize: "0.875rem", mb: 1 }}
                >
                  첨부 파일
                </Typography>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  id="fileUpload"
                  style={{ display: "none" }}
                  onChange={handleFileSelect}
                />
                <Box
                  sx={{
                    border: isDragOver
                      ? "3px dashed #007bff"
                      : "2px dashed #d0d0d0",
                    borderRadius: 2,
                    p: 3,
                    textAlign: "center",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    bgcolor: isDragOver ? "#e3f2fd" : "transparent",
                    "&:hover": { bgcolor: "#fafafa", borderColor: "#999" },
                  }}
                  onClick={openFileInput}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragEnter={handleDragEnter}
                  onDragLeave={handleDragLeave}
                >
                  <UploadFileIcon
                    sx={{ fontSize: 48, color: "#9e9e9e", mb: 1 }}
                  />
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
                <Box sx={{ display: "flex", alignItems: "center", my: 2 }}>
                  <Box
                    sx={{ flexGrow: 1, height: "1px", bgcolor: "divider" }}
                  />
                  <Typography sx={{ mx: 2, color: "text.secondary" }}>
                    OR
                  </Typography>
                  <Box
                    sx={{ flexGrow: 1, height: "1px", bgcolor: "divider" }}
                  />
                </Box>
                <Box sx={{ textAlign: "center" }}>
                  <Tooltip title="즉시 녹음 시작">
                    <IconButton
                      color="primary"
                      sx={{ border: "1px solid", p: 2 }}
                      onClick={handleStartRecording}
                      disabled={
                        isAnyRecordingActive() ||
                        isStartingRecording ||
                        isUploading
                      }
                    >
                      <MicIcon sx={{ fontSize: 40 }} />
                    </IconButton>
                  </Tooltip>
                  <Typography
                    sx={{ mt: 1, fontSize: "0.875rem", fontWeight: 500 }}
                  >
                    녹음 시작
                  </Typography>
                </Box>
              </Box>
            );
          } else {
            return (
              <Box>
                <Box sx={{ display: "flex", gap: 2, alignItems: "start" }}>
                  <Box sx={{ flex: 1 }}>
                    <Box
                      sx={{
                        px: 2,
                        pt: 2,
                        mb: 2,
                        bgcolor: "#fafafa",
                        borderRadius: 1.5,
                        "&::-webkit-scrollbar": { width: 6 },
                        "&::-webkit-scrollbar-thumb": {
                          backgroundColor: "#ccc",
                          borderRadius: 3,
                        },
                      }}
                    >
                      {/* 등록한 음성 파일 */}
                      <Box
                        key={currentStt.file?.fileId}
                        sx={{
                          display: "grid",
                          gridTemplateColumns: {
                            xs: "1fr  35px", // size 컬럼 제거
                            sm: "1fr 85px 100px 35px", // size 컬럼 포함
                          },
                          alignItems: "center",
                        }}
                      >
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1.5,
                            width: "100%",
                            minWidth: 0,
                          }}
                        >
                          <Box
                            sx={{
                              width: 32,
                              height: 32,
                              bgcolor: "gray",
                              borderRadius: 1,
                              display: "flex",
                              justifyContent: "center",
                              alignItems: "center",
                              color: "#fff",
                              fontSize: "0.7rem",
                              fontWeight: 700,
                              flexShrink: 0,
                            }}
                          >
                            <PlayCircleIcon fontSize="small" />
                          </Box>
                          <Typography
                            fontSize="small"
                            component="a"
                            href={`${BASE_URL}${currentStt.file?.path}?v=${currentStt.file?.updatedAt}`}
                            download={currentStt.file?.originalName}
                            sx={{
                              flex: 1,
                              minWidth: 0,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                              display: "block",
                            }}
                          >
                            {currentStt.file?.originalName}
                          </Typography>
                        </Box>
                        <Typography
                          sx={{ color: "text.secondary", display: { xs: "none", sm: "block" } }}
                          fontSize="0.9rem"
                        >
                          {currentStt.file?.size}
                        </Typography>
                        <Typography
                          sx={{ color: "text.secondary", display: { xs: "none", sm: "block" } }}
                          fontSize="0.9rem"
                        >
                          {currentStt.file?.createdAt}
                        </Typography>
                        <IconButton
                          size="small"
                          component="a"
                          href={`${BASE_URL}${currentStt.file?.path}?v=${currentStt.file?.updatedAt}`}
                          download={currentStt.file?.originalName}
                        >
                          <GridDownloadIcon fontSize="small" />
                        </IconButton>
                      </Box>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 2,
                          py: 1,
                        }}
                      >
                        <audio
                          key={currentStt.id}
                          className="w-full"
                          preload="metadata"
                          controls
                        >
                          <source
                            src={`${BASE_URL}${currentStt?.file?.path}?v=${currentStt?.file?.updatedAt}`}
                            type="audio/mpeg"
                          />
                        </audio>
                      </Box>
                    </Box>
                    <Typography fontWeight="bold" fontSize="1.2rem">
                      요약 결과
                      {((meeting.isEditPermitted &&
                        meeting.status !== "COMPLETED") ||
                        role === "ADMIN") && (
                        <Tooltip
                          title={currentStt.isEditable ? "저장" : "수정"}
                          placement="top"
                        >
                          <IconButton
                            size="small"
                            sx={{ color: "primary.main" }}
                            disabled={currentStt.isLoading}
                          >
                            {currentStt.isEditable ? (
                              <SaveIcon onClick={handleSummarySave} />
                            ) : (
                              <EditIcon
                                onClick={() =>
                                  updateSttState(selectedSttId, {
                                    isEditable: true,
                                  })
                                }
                              />
                            )}
                          </IconButton>
                        </Tooltip>
                      )}
                    </Typography>

                    {currentStt.isEditable ? (
                      <TextField
                        fullWidth
                        multiline
                        rows={10}
                        value={currentStt.summary}
                        onChange={handleSummaryChange}
                        sx={{
                          mt: 1,
                          mb: 2,
                          "& .MuiOutlinedInput-root": {
                            borderRadius: 1.5,
                            bgcolor: "#fafafa",
                          },
                        }}
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
                          overflow: "auto",
                          border: "1px solid",
                          borderColor: "divider",
                        }}
                      >
                        <MarkdownText content={currentStt.summary} />
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
                        overflow: "auto",
                        border: "1px solid",
                        borderColor: "divider",
                      }}
                    >
                      <MarkdownText content={currentStt.content} />
                    </Box>
                  </Box>
                </Box>
              </Box>
            );
          }
        })()}
      </div>
    </>
  );
}