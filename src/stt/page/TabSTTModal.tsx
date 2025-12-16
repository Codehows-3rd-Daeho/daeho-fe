import {
  Box,
  Button,
  Typography,
  DialogTitle,
  IconButton,
  Dialog,
  DialogContent,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import DeleteIcon from "@mui/icons-material/Delete";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import { useState } from "react";
import { uploadSTT } from "../api/sttApi";
import axios from "axios";
import { useParams } from "react-router-dom";

// TabSTTModal props
interface TabSTTModalProps {
  onUploadSuccess: () => void;
}

export default function TabSTT(props: TabSTTModalProps) {
  const [open, setOpen] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File[]>([]); //파일 선택 관련 로직에 사용

  //저장 상태 (지연시 중복 등록 방지)
  const [isSaving, setIsSaving] = useState(false);

  const { meetingId } = useParams();

  const { onUploadSuccess } = props;

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

  //모달 열기
  const handleOpen = () => setOpen(true);
  //모달 닫기
  const handleClose = () => setOpen(false);

  // 파일 입력창 열기
  const openFileInput = () => {
    document.getElementById("fileUpload")?.click();
  };

  // ========================================================================
  //                               파일 선택
  // ========================================================================

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!meetingId) {
      alert("해당 회의의 id를 찾을 수 없습니다.");
      return;
    }

    const uploadedFiles = Array.from(e.target.files || []);
    const validFiles = uploadedFiles.filter(validateFile);

    if (validFiles.length > 0) {
      setUploadedFile((prev) => [...prev, ...validFiles]);
    }
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
  //                               FormData 생성
  // ========================================================================

  const createFormData = (files: File[]) => {
    const formData = new FormData();
    files.forEach((file) => formData.append("file", file));
    return formData;
  };

  // ===============================================================
  //                          stt 등록
  // ===============================================================

  const handleRegisterClick = async () => {
    if (!meetingId) {
      alert("해당 회의의 id를 찾을 수 없습니다.");
      return;
    }

    if (uploadedFile.length === 0) {
      alert("음성 파일을 먼저 업로드해주세요.");
      return;
    }

    const ok = confirm("음성 파일을 등록하시겠습니까?");
    if (!ok) return;

    setIsSaving(true); // 버튼 등록 중으로 변경

    try {
      const formData = createFormData(uploadedFile); //formdata 생성
      await uploadSTT(meetingId, formData); //id넣어야됨

      alert("음성 파일이 변환 되었습니다!");
      setIsSaving(false); // 버튼 원상복귀
      onUploadSuccess?.(); // 부모에 알림
      setUploadedFile([]);
      handleClose();
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 401) return;
      console.error(error);
      alert("음성 파일 등록 중 오류가 발생했습니다.");
      setIsSaving(false); // 버튼 원상복귀
    }
  };

  return (
    <>
      {/* 모달 열기 버튼 */}
      <Button variant="contained" onClick={handleOpen}>
        음성 파일 등록
      </Button>

      {/* 파일 업로드 모달 */}
      <Dialog
        open={open}
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
          음성 파일 등록
          {/* 모달 닫기 버튼 */}
          <IconButton size="small" onClick={handleClose}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ p: 5 }}>
          {/* 첨부 파일 */}
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
            >
              <UploadFileIcon sx={{ fontSize: 48, color: "#9e9e9e", mb: 1 }} />
              <Typography
                sx={{ fontSize: "0.875rem", fontWeight: 500, mb: 0.5 }}
              >
                Choose files
              </Typography>
              <Typography
                sx={{ fontSize: "0.875rem", fontWeight: 500, mb: 0.5 }}
              >
                최대 파일 크기: 2GB, 허용 확장자:{" "}
                {allowedExtensions?.join(", ")}
              </Typography>
            </Box>

            <Box sx={{ mt: 2 }}>
              {uploadedFile.map((file, idx) => (
                <Box
                  key={idx}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    p: 1.5,
                    bgcolor: "#f5f5f5",
                    borderRadius: 1.5,
                    mb: 1,
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        bgcolor: "#e0e0e0",
                        borderRadius: 1,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Typography sx={{ fontSize: "1.2rem" }}>📄</Typography>
                    </Box>
                    <Box>
                      <Typography
                        sx={{ fontSize: "0.875rem", fontWeight: 500 }}
                      >
                        {file.name}
                      </Typography>
                      <Typography
                        sx={{ fontSize: "0.75rem", color: "text.secondary" }}
                      >
                        {(file.size / 1024 / 1024).toFixed(1)}MB · Uploading
                      </Typography>
                    </Box>
                  </Box>
                  <Button
                    size="small"
                    onClick={() =>
                      setUploadedFile((prev) =>
                        prev.filter((_, i) => i !== idx)
                      )
                    }
                    sx={{ minWidth: "auto", p: 1 }}
                  >
                    <DeleteIcon fontSize="small" />
                  </Button>
                </Box>
              ))}
            </Box>
          </Box>

          {/* 등록 버튼 */}
          <Box sx={{ display: "flex", justifyContent: "center" }}>
            <Button variant="outlined" onClick={handleRegisterClick}>
              {isSaving ? "음성 파일 등록 중..." : "등록"}
            </Button>
          </Box>
        </DialogContent>
      </Dialog>
    </>
  );
}
