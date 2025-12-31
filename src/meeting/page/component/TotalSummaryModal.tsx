import { useEffect } from "react";
import {
  Box,
  Dialog,
  DialogContent,
  IconButton,
  Typography,
  DialogTitle,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import MarkdownText from "../../../stt/component/MarkdownText";

interface TotalSummaryModalProps {
  open: boolean;
  onClose: () => void;
  content: string;
}

export default function TotalSummaryModal({
  open,
  onClose,
  content,
}: TotalSummaryModalProps) {

  //허용 확장자 / 최대 용량 불러오기
  useEffect(() => {
    if (!open) return;
  }, [open]);

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
            회의 내용 요약
          </Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ p: 5 }}>
          
          <Box
            sx={{
              mt: 1,
              mb: 2,
              p: 2,
              borderRadius: 1.5,
              bgcolor: "#fafafa",
              minHeight: 240,
              maxHeight: 700,
              overflow: 'auto',
              border: '1px solid',
              borderColor: 'divider',
            }}
          >
            {(content != "") ? (
            <MarkdownText content={content} />
            ) : (
            <Box sx={{ textAlign: "center", color: "text.disabled", my: 2 }}>
              등록된 회의 요약이 없습니다.
            </Box>
            )}
          </Box>
        </DialogContent>
      </Dialog>
    </>
  );
}
