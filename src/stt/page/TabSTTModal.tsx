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
import { useEffect, useState } from "react";
import {
  getExtensions,
  getFileSize,
} from "../../admin/setting/api/FileSettingApi";
import { uploadSTT } from "../api/sttApi";
import axios from "axios";
import { useParams } from "react-router-dom";

export default function TabSTT() {
  const [open, setOpen] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File[]>([]);

  //파일 설정 값
  const [maxFileSize, setMaxFileSize] = useState<number | null>(null);
  const [allowedExtensions, setAllowedExtensions] = useState<string[] | null>(
    null
  );

  //저장 상태 (지연시 중복 등록 방지)
  const [isSaving, setIsSaving] = useState(false);

  const { meetingId } = useParams();

  //모달 열기
  const handleOpen = () => setOpen(true);
  //모달 닫기
  const handleClose = () => setOpen(false);

  useEffect(() => {
    async function fetchData() {
      try {
        //=======================파일 설정값 조회===================
        const sizeConfig = await getFileSize();
        const extensionConfig = await getExtensions();

        const maxFileSizeByte = Number(sizeConfig.name); // number만 추출
        const maxFileSize = maxFileSizeByte / 1024 / 1024; //바이트 단위 → MB로 변환
        const allowedExtensions = extensionConfig.map((e) =>
          e.name.toLowerCase()
        );

        setMaxFileSize(maxFileSize);
        setAllowedExtensions(allowedExtensions);
      } catch {
        console.log("파일 설정 로딩 실패");
      }
    }
    fetchData();
  }, []);

  // 파일 입력창 열기
  const openFileInput = () => {
    document.getElementById("fileUpload")?.click();
  };

  // 파일 업로드 핸들러
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    //STT Api 호출 시 meetinfId undefind 예외 처리
    if (!meetingId) {
      alert("해당 회의의 id를 찾을 수 없습니다.");
      return;
    }

    //HTML input[type="file"]의 파일 목록 속성 이름은 files
    const uploadedFiles = Array.from(e.target.files || []);
    const formData = new FormData();

    // 백엔드의 @RequestPart("file")과 맞춰야 함
    uploadedFiles.forEach((file) => {
      formData.append("file", file);
    });

    if (!maxFileSize || !allowedExtensions) {
      alert("파일 설정값을 불러오는 중입니다. 잠시 후 다시 시도해주세요.");
      return;
    }

    //업로드 가능한 확장자, 용량의 파일을 담을 배열
    const validFiles: File[] = [];

    //업로드된 파일 배열을 돌면서 체크
    uploadedFiles.forEach((file) => {
      //확장자 추출
      const ext = file.name.split(".").pop()?.toLowerCase();

      // 1) 확장자 체크
      const isAllowed = ext != null && allowedExtensions.includes(ext);

      if (!isAllowed) {
        alert(
          `허용되지 않은 파일입니다: ${
            file.name
          }\n허용 확장자: ${allowedExtensions.join(", ")}`
        );
        return;
      }

      // 2) 용량 체크
      const sizeMB = file.size / 1024 / 1024; //바이트 단위 → MB로 변환

      if (sizeMB > maxFileSize) {
        alert(
          `${file.name} 파일의 크기가 ${maxFileSize}MB를 초과했습니다.
           (현재: ${sizeMB.toFixed(2)}MB)`
        );
        return; // 이 파일만 제외
      }

      //확장자, 용량 체크 성공한 file만 배열에 추가
      validFiles.push(file);
    });

    // 검증된 파일만 반영
    if (validFiles.length > 0) {
      setUploadedFile((prev) => [...prev, ...validFiles]);
    }

    //============================전송============================
    try {
      setIsSaving(true); // 저장 시작 (중복 클릭 방지)
      console.log("보내는 데이터", formData);

      await uploadSTT(meetingId, formData); //id넣어야됨

      alert("음성 파일이 등록되었습니다!");
      // navigator("/meeting/{id}");
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        return;
      }
      console.error("음성 파일 등록 실패:", error);
      alert("음성 파일 등록 중 오류가 발생했습니다.");
    } finally {
      setIsSaving(false); // 버튼 원상복귀
    }
  };

  // 음성 파일 등록 버튼
  const handleRegisterClick = async () => {
    if (uploadedFile.length === 0) {
      alert("음성 파일 파일을 먼저 업로드해주세요.");
      return;
    }

    const ok = confirm("음성 파일을 등록하시겠습니까?");
    if (!ok) return;

    try {
      alert("음성 파일이 등록되었습니다.");
      handleClose();
    } catch {
      alert("음성 파일 등록 중 오류가 발생했습니다.");
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
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            음성 파일 등록
          </Typography>

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
              onChange={handleFileUpload}
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
                최대 파일 크기: {maxFileSize}MB, 허용 확장자:{" "}
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
              {isSaving ? "음성 파일 등록 중..." : "음성 파일 등록 완료"}
            </Button>
          </Box>
        </DialogContent>
      </Dialog>
    </>
  );
}
