import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Typography,
  Chip,
  IconButton,
  Tabs,
  Tab,
  CircularProgress,
} from "@mui/material";

import DownloadIcon from "@mui/icons-material/Download";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";

import TabComment from "./component/TabComment";
import TabMeeting from "./component/TabMeeting";
import TabLog from "./component/TabLog";
import ParticipantListModal from "./component/ParticipantListModal";

import { useNavigate, useParams } from "react-router-dom";
import { deleteIssue, getIssueDtl, updateReadStatus } from "../api/issueApi";
import type { IssueDto } from "../type/type";
import { BASE_URL } from "../../config/httpClient";
import { useAuthStore } from "../../store/useAuthStore";
import axios from "axios";
import { getFileInfo, getStatusLabel } from "../../common/commonFunction";

export default function IssueDtl() {
  const { issueId } = useParams();
  const [issue, setIssue] = useState<IssueDto | null>(null);
  const [tabValue, setTabValue] = useState(0);
  const [showParticipantModal, setShowParticipantModal] = useState(false);
  const navigate = useNavigate();

  const { member } = useAuthStore();
  const role = member?.role;
  const currentMemberId = member?.memberId; // 현재 로그인된 사용자 id

  // 이슈 데이터 불러오기
  const fetchIssueDetail = (id: string) => {
    getIssueDtl(id)
      .then((data) => setIssue(data))
      .catch((error) => {
        if (axios.isAxiosError(error) && error.response?.status === 401) {
          return;
        }
        alert("이슈 정보를 불러오는 중 오류가 발생했습니다.");
      });
  };

  // 1차 useEffect: 이슈 정보 로드
  useEffect(() => {
    if (!issueId) return;
    fetchIssueDetail(issueId);
  }, [issueId]);

  // 2차 useEffect: 참여자의 이슈 확인 상태 업데이트
  useEffect(() => {
    // issueId, issue 데이터, 현재 사용자 ID가 모두 있어야 실행
    if (!issueId || !issue || !currentMemberId) return;

    // 1. 현재 사용자가 참여자 목록에 있는지 확인
    const isCurrentParticipant = issue.participantList.find(
      (p) => p.id === currentMemberId
    );

    // 2. 참여자이며, 아직 '미확인' 상태인 경우
    if (isCurrentParticipant && isCurrentParticipant.isRead === false) {
      updateReadStatus(issueId) // 확인 상태로 업데이트
        .then(() => {
          setIssue((prevIssue) => {
            if (!prevIssue) return null;

            // participantList에서 현재 사용자 항목을 찾아서 isRead를 true로 변경
            const updatedParticipants = prevIssue.participantList.map((p) =>
              p.id === currentMemberId
                ? { ...p, isRead: true } // isRead만 true로 변경
                : p
            );
            // 변경된 participantList로 issue 객체 반환
            return {
              ...prevIssue,
              participantList: updatedParticipants,
            };
          });
        })
        .catch((error) => {
          console.error("이슈 확인 상태 업데이트 실패:", error);
        });
    }
  }, [issueId, issue, currentMemberId]);

  // 로딩중
  if (!issue)
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "80vh",
          width: "100%",
          minWidth: "1000px",
        }}
      >
        <CircularProgress color="primary" />
      </Box>
    );

  // 삭제된 이슈인 경우.
  if (issue.isDel === true) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          height: "80vh",
          width: "100%",
          minWidth: "1000px",
        }}
      >
        <Typography variant="h4" color="error" sx={{ mb: 2 }}>
          ⚠️ 삭제된 이슈입니다.
        </Typography>

        <Button
          variant="outlined"
          onClick={() => navigate("/issue/list")}
          sx={{ borderRadius: 1.5 }}
        >
          이슈 목록으로 돌아가기
        </Button>
      </Box>
    );
  }

  const smallChipStyle = {
    borderRadius: "6px",
    height: 28,
    px: 0.5,
  };

  const handleDelete = async () => {
    const isConfirmed = window.confirm("이슈를 삭제하시겠습니까?");

    if (isConfirmed) {
      try {
        await deleteIssue(issueId as string);
        alert("이슈가 삭제되었습니다.");
        navigate("/issue/list");
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 401) {
          return;
        }
        alert("이슈 삭제 중 오류가 발생했습니다.");
      }
    }
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
          {issue.title}
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
          {issue.content}
        </Box>

        {/* 첨부 파일 */}
        <Box sx={{ mb: 4 }}>
          <Typography sx={{ fontWeight: 600 }}>첨부 파일</Typography>

          {/* 헤더 */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "1fr 120px 150px 50px",
              px: 1,
              py: 1.5,
              borderRadius: 1,
              fontWeight: 600,
              color: "text.secondary",
              borderBottom: "1px solid #dcdcdc",
              mb: 1,
            }}
          >
            <Typography>이름</Typography>
            <Typography>크기</Typography>
            <Typography>추가된 날짜</Typography>
            <Typography></Typography>
          </Box>

          {/* 파일 리스트 */}
          {issue.fileList.map((file) => {
            const { label, color } = getFileInfo(file.originalName);

            return (
              <Box
                key={file.fileId}
                sx={{
                  display: "grid",
                  gridTemplateColumns: "1fr 120px 150px 50px",
                  alignItems: "center",
                  px: 2,
                  py: 1.5,
                  bgcolor: "#fafafa",
                  borderRadius: 1.5,
                  mb: 1,
                }}
              >
                {/* 파일 이름 + 아이콘 */}
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
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
                  <Typography
                    component="a"
                    href={`${BASE_URL}${file.path}`}
                    download={file.originalName}
                  >
                    {file.originalName}
                  </Typography>
                </Box>

                {/* 크기 */}
                <Typography sx={{ color: "text.secondary" }}>
                  {file.size}
                </Typography>

                {/* 생성 날짜 */}
                <Typography sx={{ color: "text.secondary" }}>
                  {file.createdAt}
                </Typography>

                {/* 다운로드 버튼 */}
                <IconButton
                  size="small"
                  component="a"
                  href={`${BASE_URL}${file.path}`}
                  download={file.originalName}
                >
                  <DownloadIcon fontSize="small" />
                </IconButton>
              </Box>
            );
          })}
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
              <span
                className={`px-3 py-1 text-sm font-semibold rounded-sm ${
                  issue.status === "IN_PROGRESS"
                    ? "bg-blue-100 text-blue-700 "
                    : "bg-red-100 text-red-700"
                }`}
              >
                {getStatusLabel(issue.status)}
              </span>
            }
          />

          {/* 주관자 */}
          <InfoRow
            label="주관자"
            value={`${issue.hostName} ${issue.hostJPName || ""}`}
          />

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
                <Typography sx={{ fontWeight: 500 }}>
                  {issue.startDate}
                </Typography>
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
                <Typography sx={{ fontWeight: 500 }}>
                  {issue.endDate}
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* 카테고리 */}
          <InfoRow
            label="카테고리"
            value={
              <Chip
                label={issue.categoryName}
                variant="outlined"
                sx={smallChipStyle}
              />
            }
          />

          {/* 관련 부서 */}
          <InfoRow
            label="관련 부서"
            value={
              <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", flex: 1 }}>
                {issue.departmentName.map((dpt) => (
                  <Chip
                    key={dpt}
                    label={dpt}
                    variant="outlined"
                    sx={smallChipStyle}
                  />
                ))}
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
          <InfoRow label="작성일" value={issue.createdAt} />

          {/* 수정일 */}
          <InfoRow label="수정일" value={issue.updatedAt} />
        </Box>

        {/* 버튼 */}
        {(issue.isEditPermitted || role === "ADMIN") &&
          issue.isDel === false && (
            <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}>
              <Button
                variant="contained"
                startIcon={<EditIcon />}
                sx={{
                  borderRadius: 1.5,
                  backgroundColor: "#5497ff",
                }}
                onClick={() => {
                  navigate(`/issue/${issueId}/update`);
                }}
              >
                수정
              </Button>
              <Button
                variant="contained"
                startIcon={<DeleteIcon />}
                sx={{ borderRadius: 1.5, backgroundColor: "#5497ff" }}
                onClick={handleDelete}
              >
                삭제
              </Button>
            </Box>
          )}
      </Box>
      <ParticipantListModal
        open={showParticipantModal}
        onClose={() => setShowParticipantModal(false)}
        members={issue.participantList}
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
        alignItems: "flex-start",
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

      <Box sx={{ flex: 1 }}>{value}</Box>
    </Box>
  );
}
