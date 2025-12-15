import { useEffect, useState } from "react";
import { getSTT } from "../api/sttApi";
import TabSTTModal from "./TabSTTModal";
import { Box, Button, Typography, TextField } from "@mui/material";
import { useParams } from "react-router-dom";
import axios from "axios";

export default function TabSTT() {
  const { meetingId } = useParams();
  const [stt, setStt] = useState<string>(""); // STT 내용을 상태로 관리
  //새파일 등록시 재로딩을 위해 사용
  const [refresh, setRefresh] = useState(false);

  useEffect(() => {
    // useEffect 내부에 async 함수 정의
    const fetchSTT = async () => {
      try {
        const response = await getSTT(meetingId!);
        setStt(response[0]?.content ?? "");
        console.log("response[0]?.content: ", response[0]?.content);
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 404) {
          // DB에 값이 없을 때
          setStt("");
        } else {
          console.error("STT 불러오기 실패:", error);
        }
      }
    };

    fetchSTT();
  }, [meetingId, refresh]);
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
        <TabSTTModal onUploadSuccess={() => setRefresh((prev) => !prev)} />
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
              value={stt}
              rows={3}
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
