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
import FileUploadOutlinedIcon from "@mui/icons-material/FileUploadOutlined";
import { useState } from "react";

export default function TabSTT() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* 모달 열기 버튼 */}
      <Button variant="contained" onClick={() => setOpen(true)}>
        음성 파일 등록
      </Button>

      {/* 파일 업로드 모달 */}
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
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

          {/* 모달 닫기 버튼 */}
          <IconButton size="small" onClick={() => setOpen(false)}>
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
          >
            <input type="file" id="fileUpload" style={{ display: "none" }} />

            <label htmlFor="fileUpload" style={{ cursor: "pointer" }}>
              <Box sx={{ display: "flex", justifyContent: "center" }}>
                <FileUploadOutlinedIcon sx={{ fontSize: 50, color: "#aaa" }} />
              </Box>

              <Button
                variant="outlined"
                component="span"
                sx={{
                  borderRadius: 2,
                  borderColor: "#cbd5e1",
                  color: "#475569",
                  fontSize: "0.875rem",
                  textTransform: "none",
                }}
              >
                파일 선택
              </Button>
            </label>
          </Box>

          {/* 등록 버튼 */}
          <Box sx={{ display: "flex", justifyContent: "center" }}>
            <Button variant="outlined">회의록 등록</Button>
          </Box>
        </DialogContent>
      </Dialog>
    </>
  );
}
