import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  IconButton,
  Typography,
  DialogTitle,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import FileUploadOutlinedIcon from "@mui/icons-material/FileUploadOutlined";
import DeleteIcon from "@mui/icons-material/Delete";
import { formatFileSize, getFileInfo } from "../../../common/commonFunction";
import {
  getExtensions,
  getFileSize,
} from "../../../admin/setting/api/FileSettingApi";
import axios from "axios";
import { saveMeetingMinutes } from "../../api/MeetingApi";

interface UploadedFile {
  file: File;
  name: string;
  size: number;
}

interface FileUploadModalProps {
  open: boolean;
  onClose: () => void;
  fetchMeetingDetail: (id: string) => void;
  meetingId: string;
}

export default function FileUploadModal({
  open,
  onClose,
  fetchMeetingDetail,
  meetingId,
}: FileUploadModalProps) {
  const [uploadedFile, setUploadedFile] = useState<UploadedFile[]>([]);
  const [allowedExtensions, setAllowedExtensions] = useState<string[]>([]);
  const [maxFileSizeBytes, setMaxFileSizeBytes] = useState<number>(1048576);

  //허용 확장자 / 최대 용량 불러오기
  useEffect(() => {
    if (!open) return;

    (async () => {
      try {
        const extRes = await getExtensions();
        const sizeRes = await getFileSize();

        setAllowedExtensions(extRes.map((e) => e.name.toLowerCase()));
        setMaxFileSizeBytes(Number(sizeRes.name));
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 401) {
          return;
        }
        alert("파일 설정 불러오기 실패");
      }
    })();
  }, [open]);

  /** 파일 업로드 */
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;

    // 하나만 가능
    if (uploadedFile.length >= 1) {
      alert("회의록은 하나만 등록할 수 있습니다.");
      e.target.value = "";
      return;
    }

    const selected = e.target.files[0];

    /** 확장자 체크 */
    const ext = selected.name.split(".").pop()?.toLowerCase() || "";
    if (!allowedExtensions.includes(ext)) {
      alert(`허용되지 않은 파일 형식입니다. (${allowedExtensions.join(", ")})`);
      e.target.value = "";
      return;
    }

    /** 파일 크기 체크 */
    if (selected.size > maxFileSizeBytes) {
      alert(
        `파일 용량은 최대 ${formatFileSize(
          maxFileSizeBytes
        )}까지 업로드할 수 있습니다.`
      );
      return;
    }

    setUploadedFile([
      { file: selected, name: selected.name, size: selected.size },
    ]);
    e.target.value = "";
  };

  // 파일 삭제
  const removeFile = () => setUploadedFile([]);

  // 회의록 등록 버튼
  const handleRegisterClick = async () => {
    if (uploadedFile.length === 0) {
      alert("회의록 파일을 먼저 업로드해주세요.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("file", uploadedFile[0].file);

      await saveMeetingMinutes(meetingId, formData);
      alert("회의록이 등록되었습니다.");
      fetchMeetingDetail(meetingId);
      onClose();
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        return;
      }
      alert("회의록 등록 중 오류가 발생했습니다.");
    }
  };

  // 드래그 오버 시 브라우저 기본 동작 막기
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  // 드롭 시 파일 처리
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!e.dataTransfer.files || e.dataTransfer.files.length === 0) return;

    const file = e.dataTransfer.files[0];

    // 파일 하나만 허용
    if (uploadedFile.length >= 1) {
      alert("회의록은 하나만 등록할 수 있습니다.");
      return;
    }

    // 확장자 체크
    const ext = file.name.split(".").pop()?.toLowerCase() || "";
    if (!allowedExtensions.includes(ext)) {
      alert(`허용되지 않은 확장자입니다. ${file.name}`);
      return;
    }

    // 파일 크기 체크
    if (file.size > maxFileSizeBytes) {
      alert(
        `파일 용량은 최대 ${formatFileSize(
          maxFileSizeBytes
        )}까지 업로드할 수 있습니다.`
      );
      return;
    }

    setUploadedFile([{ file, name: file.name, size: file.size }]);
  };

  return (
    <>
      {/* 파일 업로드 모달 */}
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="md"
        fullWidth
        slotProps={{
          paper: {
            sx: {
              borderRadius: 4,
              maxWidth: 600,
            },
          },
        }}
      >
        <DialogTitle
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            회의록 등록
          </Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ p: 5 }}>
          {/* 업로드 영역 */}
          <Box
            sx={{
              border: "2px dashed #cbd5e1",
              borderRadius: 3,
              p: 2,
              mb: 2,
              textAlign: "center",
              transition: "0.3s",
              "&:hover": { bgcolor: "#f1f5f9" },
            }}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            <input
              type="file"
              id="fileUpload"
              style={{ display: "none" }}
              onChange={handleFileUpload}
              accept={allowedExtensions.map((e) => `.${e}`).join(",")}
            />

            <label htmlFor="fileUpload" style={{ cursor: "pointer" }}>
              <Box sx={{ display: "flex", justifyContent: "center" }}>
                <FileUploadOutlinedIcon sx={{ fontSize: 50, color: "#aaa" }} />
              </Box>

              <Typography
                sx={{ color: "#64748b", fontSize: "0.8rem", mt: 2, mb: 2 }}
              >
                최대 용량 : {formatFileSize(maxFileSizeBytes)} <br />
                등록 가능 확장자: {allowedExtensions.join(", ").toUpperCase()}
              </Typography>

              <Button
                variant="outlined"
                sx={{
                  borderRadius: 2,
                  borderColor: "#cbd5e1",
                  color: "#475569",
                  fontSize: "0.875rem",
                  textTransform: "none",
                }}
                component="span"
              >
                파일 선택
              </Button>
            </label>
          </Box>

          {/* 업로드된 파일 리스트 */}
          {uploadedFile.length > 0 && (
            <Box sx={{ mb: 3 }}>
              {uploadedFile.map((file, index) => {
                const { label, color } = getFileInfo(file.name);

                return (
                  <Box
                    key={index}
                    sx={{
                      display: "grid",
                      gridTemplateColumns: "1fr auto",
                      alignItems: "center",
                      px: 2,
                      py: 1.5,
                      mb: 1,
                      bgcolor: "#fafafa",
                      borderRadius: 1.5,
                      border: "1px solid #e2e8f0",
                    }}
                  >
                    <Box
                      sx={{ display: "flex", alignItems: "center", gap: 1.5 }}
                    >
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

                      <Box>
                        <Typography
                          sx={{ fontWeight: 500, fontSize: "0.875rem" }}
                        >
                          {file.name}
                        </Typography>
                        <Typography
                          sx={{ fontSize: "0.75rem", color: "#64748b" }}
                        >
                          {formatFileSize(file.size)}
                        </Typography>
                      </Box>
                    </Box>

                    <IconButton
                      onClick={removeFile}
                      size="small"
                      sx={{
                        "&:hover": {
                          bgcolor: "#fef2f2",
                          "& .MuiSvgIcon-root": { color: "#ef4444" },
                        },
                      }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                );
              })}
            </Box>
          )}

          {/* 등록 버튼 */}
          <Box sx={{ display: "flex", justifyContent: "center" }}>
            <Button variant="outlined" onClick={handleRegisterClick}>
              회의록 등록
            </Button>
          </Box>
        </DialogContent>
      </Dialog>
    </>
  );
}
