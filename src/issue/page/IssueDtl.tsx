import { useState } from "react";
import {
  Box,
  Button,
  Typography,
  Chip,
  IconButton,
  Tabs,
  Tab,
} from "@mui/material";

import DownloadIcon from "@mui/icons-material/Download";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";

import TabComment from "./component/TabComment";
import TabMeeting from "./component/TabMeeting";
import TabLog from "./component/TabLog";
import ParticipantListModal from "./component/ParticipantListModal";

interface Participant {
  id: number;
  name: string;
  department: string;
  status: "available" | "unavailable";
}

export default function IssueDtl() {
  const [tabValue, setTabValue] = useState(0);
  const [showParticipantModal, setShowParticipantModal] = useState(false);

  const participants: Participant[] = [
    {
      id: 1,
      name: "홍길동 대리",
      department: "연구개발",
      status: "unavailable",
    },
    { id: 2, name: "홍길동 대리", department: "연구개발", status: "available" },
    {
      id: 3,
      name: "홍길동 대리",
      department: "영업/고객",
      status: "unavailable",
    },
  ];

  const smallChipStyle = {
    borderRadius: "6px",
    height: 28,
    px: 0.5,
  };

  return (
    <Box
      sx={{
        display: "flex",
        gap: 3,
        p: 3,
        bgcolor: "#f5f5f5",
        minWidth: "1000px",
      }}
    >
      {/* 왼쪽 섹션 */}
      <Box
        sx={{ flex: 1, bgcolor: "white", borderRadius: 2, p: 3, boxShadow: 1 }}
      >
        {/* 제목 */}
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
          제목입니다.
        </Typography>

        {/* 본문 */}
        <Box
          sx={{
            p: 3,
            bgcolor: "#fafafa",
            borderRadius: 2,
            mb: 3,
            minHeight: 200,
            lineHeight: 1.7,
            color: "text.secondary",
          }}
        >
          Lorem Ipsum is simply dummy text of the printing and typesetting
          industry. Lorem Ipsum has been the industry's standard dummy text ever
          since the 1500s, when an unknown printer took a galley of type and
          scrambled it to make a type specimen book. It has survived not only
          five centuries, but also the leap into electronic typesetting,
          remaining essentially unchanged. It was popularised in the 1960s with
          the release of Letraset sheets containing Lorem Ipsum passages, and
          more recently with desktop publishing software like Aldus PageMaker
          including versions of Lorem Ipsum.
        </Box>

        {/* 첨부 파일 */}
        <Box sx={{ mb: 4 }}>
          <Typography sx={{ fontWeight: 600, mb: 2 }}>첨부 파일</Typography>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "1fr auto auto auto",
              alignItems: "center",
              gap: 2,
              p: 2,
              bgcolor: "#fafafa",
              borderRadius: 1.5,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  bgcolor: "#ff6b6b",
                  borderRadius: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  fontWeight: 700,
                  fontSize: "0.7rem",
                }}
              >
                PDF
              </Box>
              <Typography>파일명.pdf</Typography>
            </Box>
            <Typography sx={{ color: "text.secondary" }}>122 KB</Typography>
            <Typography sx={{ color: "text.secondary" }}>
              07 11월 2025 11:43오전
            </Typography>
            <IconButton size="small">
              <DownloadIcon fontSize="small" />
            </IconButton>
          </Box>
        </Box>

        {/* 댓글 섹션 */}
        <Box>
          <Tabs
            value={tabValue}
            onChange={(_, val) => setTabValue(val)}
            sx={{ mb: 2 }}
          >
            <Tab label="댓글" />
            <Tab label="회의" />
            <Tab label="로그" />
          </Tabs>

          <Box p={2}>
            {tabValue === 0 && <TabComment />}
            {tabValue === 1 && <TabMeeting />}
            {tabValue === 2 && <TabLog />}
          </Box>
        </Box>
      </Box>

      {/* 오른쪽 섹션 */}
      <Box
        sx={{ width: 400, display: "flex", flexDirection: "column", gap: 2 }}
      >
        <Box sx={{ bgcolor: "white", borderRadius: 2, p: 3, boxShadow: 1 }}>
          {/* 상태 */}
          <InfoRow
            label="상태"
            value={
              <span className="px-3 py-1 text-sm font-semibold bg-blue-100 text-blue-700 rounded-sm">
                진행중
              </span>
            }
          />

          {/* 주관자 */}
          <InfoRow label="주관자" value="홍길동 팀장" />

          {/* 시작일 + 마감일*/}
          <Box
            sx={{
              display: "flex",
              width: "100%",
              mb: 3,
              gap: 2,
            }}
          >
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                width: "50%",
                textAlign: "left",
              }}
            >
              {/* 라벨 */}
              <Typography
                sx={{
                  fontWeight: 500,
                  mb: 1,
                }}
              >
                시작일
              </Typography>

              {/* 날짜 */}
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  border: "1px solid #d0d0d0",
                  borderRadius: "8px",
                  p: "6px 10px",
                }}
              >
                <CalendarTodayOutlinedIcon
                  fontSize="small"
                  sx={{ color: "#616161" }}
                />
                <Typography sx={{ fontWeight: 500 }}>2025. 11. 12</Typography>
              </Box>
            </Box>

            {/*  마감일 */}
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                width: "50%",
                textAlign: "left",
              }}
            >
              {/* 마감일 라벨 */}
              <Typography
                sx={{
                  fontWeight: 500,
                  mb: 1,
                }}
              >
                마감일
              </Typography>

              {/* 마감일 날짜 */}
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  border: "1px solid #d0d0d0",
                  borderRadius: "8px",
                  p: "6px 10px",
                }}
              >
                <CalendarTodayOutlinedIcon
                  fontSize="small"
                  sx={{ color: "#616161" }}
                />
                <Typography sx={{ fontWeight: 500 }}>2025. 11. 12</Typography>
              </Box>
            </Box>
          </Box>

          {/* 카테고리 */}
          <InfoRow
            label="카테고리"
            value={
              <Chip label="영업/고객" variant="outlined" sx={smallChipStyle} />
            }
          />

          {/* 관련 부서 */}
          <InfoRow
            label="관련 부서"
            value={
              <Box sx={{ display: "flex", gap: 1 }}>
                <Chip label="디자인팀" variant="outlined" sx={smallChipStyle} />
                <Chip label="마케팅팀" variant="outlined" sx={smallChipStyle} />
              </Box>
            }
          />

          {/* 참여자 */}
          <InfoRow
            label="참여자"
            value={
              <Button
                variant="outlined"
                size="small"
                sx={{ borderRadius: 1.5 }}
                onClick={() => setShowParticipantModal(true)}
              >
                참여자 확인
              </Button>
            }
          />
          {/* 작성일 */}
          <InfoRow label="작성일" value="2025.11.11 15:32" />

          {/* 수정일 */}
          <InfoRow label="수정일" value="2025.11.12 10:33" />
        </Box>

        {/* 버튼 */}
        <Box sx={{ display: "flex", gap: 1 }}>
          <Button
            variant="contained"
            startIcon={<EditIcon />}
            fullWidth
            sx={{ borderRadius: 1.5 }}
          >
            수정
          </Button>
          <Button
            variant="contained"
            startIcon={<DeleteIcon />}
            fullWidth
            sx={{ borderRadius: 1.5 }}
          >
            삭제
          </Button>
        </Box>
      </Box>
      <ParticipantListModal
        open={showParticipantModal}
        onClose={() => setShowParticipantModal(false)}
        participants={participants}
      />
    </Box>
  );
}

/* 재사용 Row 컴포넌트 */
function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        mb: 3,
      }}
    >
      <Typography
        sx={{
          fontWeight: 500,
          width: "90px",
        }}
      >
        {label}
      </Typography>

      <Box sx={{ display: "flex", alignItems: "center" }}>{value}</Box>
    </Box>
  );
}
