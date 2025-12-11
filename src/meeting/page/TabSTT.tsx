import TabSTTModal from "./TabSTTModal";
import { Box, Button, Typography, TextField } from "@mui/material";

export default function TabSTT() {
  // const [uploadedFile, setUploadedFile] = useState<UploadedFile[]>([]);
  return (
    <>
      {/* STT 제목 */}
      <Typography fontWeight={600} mb={2}>
        STT
      </Typography>

      {/* stt 헤더 바 */}
      <Box>
        <Button>음성 파일 1</Button>
        <Button>음성 파일 2</Button>
        <TabSTTModal />
      </Box>

      <Box>
        <Box sx={{ display: "flex", gap: 2, alignItems: "start", mt: 3 }}>
          <Box sx={{ flex: 1 }}>
            <Typography>요약 결과</Typography>
            <TextField
              fullWidth
              multiline
              rows={3}
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
              rows={3}
              disabled
              sx={{
                mb: 2,
                "& .MuiOutlinedInput-root": {
                  borderRadius: 1.5,
                  bgcolor: "#fafafa",
                },
              }}
            />

            <Box sx={{ display: "flex", gap: 1, justifyContent: "flex-end" }}>
              <Button
                variant="outlined"
                size="small"
                disabled
                sx={{ borderRadius: 1.5 }}
              >
                전체 보기
              </Button>
            </Box>
          </Box>
        </Box>
      </Box>
    </>
  );
}
