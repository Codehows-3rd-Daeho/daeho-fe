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

import { BASE_URL, type ApiError } from "../../config/httpClient";
import { useAuthStore } from "../../store/useAuthStore";
import { getFileInfo, getStatusLabel } from "../../common/commonFunction";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import type { MeetingDto } from "../type/type";
import {
  deleteMeeting,
  deleteMeetingMinutes,
  getMeetingDtl,
  updateMeetingReadStatus,
} from "../api/MeetingApi";

import ParticipantListModal from "../../issue/page/component/ParticipantListModal";
import FileUploadModal from "./component/FileUploadModal";
import TabSTT from "../../stt/page/TabSTT";
import TabComment from "./component/TabComment";
import TabLog from "./component/TabLog";
import TotalSummaryModal from "./component/TotalSummaryModal";
import LockIcon from "@mui/icons-material/Lock";

export default function MeetingDtl() {
  const { meetingId } = useParams();
  const [meeting, setMeeting] = useState<MeetingDto | null>(null);
  const [tabValue, setTabValue] = useState(0);
  const [showParticipantModal, setShowParticipantModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const { member } = useAuthStore();
  const role = member?.role;
  const currentMemberId = member?.memberId;

  useEffect(() => {
    if (location.state?.openSttTab) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTabValue(1);
    }
  }, [location.state]);

  // 데이터 불러오기
  const fetchMeetingDetail = (id: string) => {
    getMeetingDtl(id)
      .then((data) => setMeeting(data))
      .catch((error) => {
        const apiError = error as ApiError;
        const response = apiError.response?.data?.message;
        alert(response ?? "오류가 발생했습니다.");
      });
  };

  // 1차 useEffect: 회의
  useEffect(() => {
    if (!meetingId) return;
    fetchMeetingDetail(meetingId);
  }, [meetingId]);

  // 2차 useEffect: 참여자의 이슈 확인 상태 업데이트
  useEffect(() => {
    if (!meetingId || !meeting || !currentMemberId) return;

    // 현재 사용자가 참여자 목록에 있는지 확인
    const isCurrentParticipant = meeting.participantList.find(
      (p) => p.id === currentMemberId
    );

    // 참여자이며, 아직 '미확인' 상태인 경우
    if (isCurrentParticipant && isCurrentParticipant.isRead === false) {
      updateMeetingReadStatus(meetingId) // 확인 상태로 업데이트
        .then(() => {
          setMeeting((prevMeeting) => {
            if (!prevMeeting) return null;
            const updatedParticipants = prevMeeting.participantList.map((p) =>
              p.id === currentMemberId
                ? { ...p, isRead: true } // isRead만 true로 변경
                : p
            );
            // 변경된 participantList로 객체 반환
            return {
              ...prevMeeting,
              participantList: updatedParticipants,
            };
          });
        })
        .catch((error) => {
          const apiError = error as ApiError;
          const response = apiError.response?.data?.message;
          alert(response ?? "오류가 발생했습니다.");
        });
    }
  }, [meetingId, meeting, currentMemberId]);

  // 로딩중
  if (!meeting)
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

  // 삭제된 회의인 경우.
  if (meeting.isDel === true) {
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
          ⚠️ 삭제된 회의입니다.
        </Typography>

        <Button
          variant="outlined"
          onClick={() => navigate("/meeting/list")}
          sx={{ borderRadius: 1.5 }}
        >
          회의 목록으로 돌아가기
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
    const isConfirmed = window.confirm("회의를 삭제하시겠습니까?");

    if (isConfirmed) {
      try {
        await deleteMeeting(meetingId as string);
        alert("회의가 삭제되었습니다.");
        navigate("/meeting/list");
      } catch (error) {
        const apiError = error as ApiError;
        const response = apiError.response?.data?.message;

        alert(response ?? "회의 삭제 중 오류가 발생했습니다.");
      }
    }
  };

  const handleDeleteMinutes = async () => {
    if (!meeting || !meeting.meetingMinutes) return;
    const fileId = meeting.meetingMinutes.fileId;
    if (!window.confirm("회의록을 삭제하시겠습니까?")) return;

    try {
      await deleteMeetingMinutes(meetingId as string, String(fileId));
      alert("회의록이 삭제되었습니다.");
      fetchMeetingDetail(meetingId as string);
    } catch (error) {
      const apiError = error as ApiError;
      const response = apiError.response?.data?.message;

      alert(response ?? "회의록 삭제 중 오류가 발생했습니다.");
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        gap: { md: 3 },
        p: { md: 3 },
        bgcolor: { xs: "white", md: "#f5f5f5" },
        minWidth: { xs: "100%", md: 300 },
        flexDirection: { xs: "column", md: "row" }, // 모바일: 세로(1, 2), 데스크탑: 가로(1,2)
      }}
    >
      {/* 왼쪽 섹션 */}
      <Box
        sx={{
          flex: 1,
          bgcolor: "white",
          borderRadius: { md: 2 },
          p: { md: 3 },
          boxShadow: { md: 1 },
        }}
      >
        {/* 제목 */}
        <Typography
          variant="h5"
          sx={{
            fontWeight: 700,
            mb: { xs: 2, md: 3 },
            fontSize: { xs: "1.25rem", md: "1.5rem" },
          }}
        >
          {meeting.title}
        </Typography>

        {/* 본문 */}
        <Box
          sx={{
            p: { xs: 1.5, md: 2 },
            bgcolor: "#fafafa",
            borderRadius: 2,
            mb: 3,
            minHeight: 200,
            lineHeight: 1.7,
            border: "1px solid",
            borderColor: "divider",
            whiteSpace: "pre-line",
          }}
        >
          {meeting.content}
        </Box>

        {/* 첨부 파일 섹션 */}
        <Box sx={{ mb: 4 }}>
          <Typography sx={{ fontWeight: 600, mb: 1 }}>첨부 파일</Typography>

          {/* 헤더: 모바일(xs) 2컬럼, 데스크탑(md) 4컬럼 */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr 50px",
                sm: "1fr 80px 40px",
                md: "1fr 120px 150px 50px",
              },
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
            {/* md 이상일 때만 표시 */}
            <Typography sx={{ display: { xs: "none", md: "block" } }}>
              크기
            </Typography>
            <Typography sx={{ display: { xs: "none", md: "block" } }}>
              추가된 날짜
            </Typography>
            <Typography sx={{ textAlign: "center" }}>다운</Typography>
          </Box>

          {/* 파일 리스트 */}
          {meeting.fileList.length === 0 && (
            <Box sx={{ textAlign: "center", color: "text.disabled", my: 2 }}>
              등록된 파일이 없습니다.
            </Box>
          )}
          <Box
            sx={{
              maxHeight: meeting.fileList.length > 4 ? 260 : "auto",
              overflowY: meeting.fileList.length > 4 ? "auto" : "visible",
              pr: meeting.fileList.length > 4 ? 1 : 0,
            }}
          >
            {meeting.fileList.map((file) => {
              const { label, color } = getFileInfo(file.originalName);

              return (
                <Box
                  key={file.fileId}
                  sx={{
                    display: "grid",
                    gridTemplateColumns: {
                      xs: "1fr 50px",
                      sm: "1fr 80px 40px",
                      md: "1fr 120px 150px 50px",
                    },
                    alignItems: "center",
                    px: { xs: 1, md: 2 },
                    py: 1.5,
                    bgcolor: "#fafafa",
                    borderRadius: 1.5,
                    mb: 1,
                    gap: 1,
                  }}
                >
                  {/* 파일 이름 + 아이콘 (말줄임 처리 추가) */}
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1.5,
                      minWidth: 0,
                    }}
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
                        flexShrink: 0,
                      }}
                    >
                      {label}
                    </Box>
                    <Typography
                      component="a"
                      href={`${BASE_URL}${file.path}`}
                      download={file.originalName}
                      sx={{
                        textDecoration: "none",
                        color: "inherit",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        fontSize: { xs: "0.9rem", md: "1rem" },
                      }}
                    >
                      {file.originalName}
                    </Typography>
                  </Box>

                  {/* 크기 (md 이상만) */}
                  <Typography
                    sx={{
                      color: "text.secondary",
                      display: { xs: "none", md: "block" },
                    }}
                  >
                    {file.size}
                  </Typography>

                  {/* 생성 날짜 (md 이상만) */}
                  <Typography
                    sx={{
                      color: "text.secondary",
                      display: { xs: "none", md: "block" },
                    }}
                  >
                    {file.createdAt}
                  </Typography>

                  {/* 다운로드 버튼 */}
                  <Box sx={{ display: "flex", justifyContent: "center" }}>
                    <IconButton
                      size="small"
                      component="a"
                      href={`${BASE_URL}${file.path}`}
                      download={file.originalName}
                    >
                      <DownloadIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </Box>
              );
            })}
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
            <Tab label="회의 내용" />
            <Tab label="로그" />
          </Tabs>

          <Box p={2}>
            {tabValue === 0 && <TabComment meetingId={Number(meetingId)} />}
            {tabValue === 1 && (
              <TabSTT
                meeting={meeting}
                fetchMeetingDetail={fetchMeetingDetail}
              />
            )}
            {tabValue === 2 && <TabLog meetingId={meetingId!} />}
          </Box>
        </Box>
      </Box>

      {/* 오른쪽 섹션 */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          // justifyContent: "center",
        }}
      >
        <Box
          sx={{
            width: "100%",
            display: "flex",
            flexDirection: "column",
            gap: 2,
            p: { xs: 2, md: 3 },
            mt: { xs: 5, md: 0 },
            bgcolor: "white",
            borderRadius: { md: 2 },
            boxShadow: { md: 1 },
            minWidth: { xs: 0, md: 400 },
            maxWidth: 450,
          }}
        >
          {/* 상태 */}
          <InfoRow
            label="상태"
            value={
              <span
                className={`px-3 py-1 text-sm font-semibold rounded-sm ${
                  meeting.status === "PLANNED"
                    ? "bg-green-100 text-green-700"
                    : meeting.status === "IN_PROGRESS"
                    ? "bg-blue-100 text-blue-700 "
                    : "bg-red-100 text-red-700"
                }`}
              >
                {getStatusLabel(meeting.status)}
              </span>
            }
          />

          {/* 주관자 */}
          <InfoRow
            label="주관자"
            value={`${meeting.hostName || ""} ${meeting.hostJPName || ""}`}
          />

          {/* 관련 이슈 */}
          <InfoRow
            label="관련 이슈"
            value={
              <Typography
                sx={{
                  color: "#1976d2",
                  cursor: "pointer",
                  maxWidth: "290px",
                  overflow: "hidden",
                  whiteSpace: "nowrap",
                  textOverflow: "ellipsis", // 뒤에 '...' 자동 추가
                }}
                title={meeting.issueTitle}
                onClick={() => navigate(`/issue/${meeting.issueId}`)}
              >
                {meeting.issueTitle}
              </Typography>
            }
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
              <Typography
                sx={{
                  fontWeight: 500,
                  mb: 1,
                }}
              >
                시작일
              </Typography>
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
                <Typography
                  sx={{
                    fontWeight: 500,
                    // fontSize: "0.9rem",
                    whiteSpace: "nowrap",
                  }}
                >
                  {meeting.startDate}
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
              <Typography
                sx={{
                  fontWeight: 500,
                  mb: 1,
                }}
              >
                마감일
              </Typography>
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
                <Typography
                  sx={{
                    fontWeight: 500,
                    // fontSize: "0.9rem",
                    whiteSpace: "nowrap",
                  }}
                >
                  {meeting.endDate}
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* 카테고리 */}
          <InfoRow
            label="카테고리"
            value={
              <Chip
                label={meeting.categoryName}
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
                {meeting.departmentName.map((dpt) => (
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

          <InfoRow label="작성일" value={meeting.createdAt} />
          <InfoRow label="수정일" value={meeting.updatedAt} />

          {/* 회의록 */}
          <InfoRow
            label="회의록"
            value={
              meeting.meetingMinutes ? (
                // 회의록이 존재할 때 → 파일 정보 + 다운로드 버튼 표시
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 2,
                  }}
                >
                  <Box sx={{ display: "flex", flexDirection: "column" }}>
                    <Typography
                      title={meeting.meetingMinutes.originalName}
                      component="a"
                      href={`${BASE_URL}${meeting.meetingMinutes.path}`}
                      download={meeting.meetingMinutes.originalName}
                      sx={{
                        maxWidth: 250,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        fontWeight: 500,
                      }}
                    >
                      {meeting.meetingMinutes.originalName}
                    </Typography>
                    <Typography
                      sx={{ color: "text.secondary", fontSize: "0.8rem" }}
                    >
                      {meeting.meetingMinutes.size}
                    </Typography>
                  </Box>

                  {/* 우측 아이콘 (권한에 따라 다르게) */}
                  {meeting.isEditPermitted ? (
                    // 권한자: 삭제
                    <IconButton
                      size="small"
                      onClick={handleDeleteMinutes} // 회의록 삭제 API 호출 후 재조회
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  ) : (
                    // 일반 사용자: 다운로드
                    <IconButton
                      size="small"
                      component="a"
                      href={`${BASE_URL}${meeting.meetingMinutes.path}`}
                      download={meeting.meetingMinutes.originalName}
                    >
                      <DownloadIcon fontSize="small" />
                    </IconButton>
                  )}
                </Box>
              ) : (
                // 회의록이 null일 때 → 등록 버튼
                <Button
                  variant="outlined"
                  size="small"
                  sx={{ borderRadius: 1.5 }}
                  onClick={() => setShowUploadModal(true)}
                >
                  회의록 등록
                </Button>
              )
            }
          />
          {/* 회의 요약 */}
          <InfoRow
            label="회의 요약"
            value={
              <Button
                variant="outlined"
                size="small"
                sx={{ borderRadius: 1.5 }}
                onClick={() => setShowSummaryModal(true)}
              >
                요약 보기
              </Button>
            }
          />
          {/* 비밀글 여부: 비밀글(isPrivate이 true)일 때만 표시 */}
          {meeting.isPrivate && (
            <Box>
              <LockIcon
                sx={{
                  fontSize: 18,
                  mr: 0.5,
                  color: "text.secondary",
                  flexShrink: 0,
                }}
              />
              비밀글 입니다
            </Box>
          )}
        </Box>

        {/* 버튼 */}
        {((meeting.isEditPermitted && meeting.status !== "COMPLETED") ||
          role === "ADMIN") &&
          meeting.isDel === false && (
            <Box
              sx={{
                display: "flex",
                justifyContent: "flex-end",
                width: "100%",
                gap: 1,
                p: { xs: 2, md: 0 },
              }}
            >
              {" "}
              <Button
                variant="contained"
                startIcon={<EditIcon />}
                sx={{
                  mt: 3,
                  width: 100,
                  fontWeight: 600,
                  borderRadius: 1.5,
                  "&:hover": { boxShadow: 3 },
                }}
                onClick={() => {
                  navigate(`/meeting/${meetingId}/update`);
                }}
              >
                수정
              </Button>
              <Button
                variant="contained"
                startIcon={<DeleteIcon />}
                sx={{
                  mt: 3,
                  width: 100,
                  fontWeight: 600,
                  borderRadius: 1.5,
                  "&:hover": { boxShadow: 3 },
                }}
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
        members={meeting.participantList}
      />
      <FileUploadModal
        open={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        meetingId={meetingId!}
        fetchMeetingDetail={fetchMeetingDetail}
      />
      <TotalSummaryModal
        open={showSummaryModal}
        onClose={() => setShowSummaryModal(false)}
        content={meeting.totalSummary}
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
        gap: 2,
      }}
    >
      <Typography
        sx={{
          fontWeight: 500,
          width: "90px",
          flexShrink: 0,
        }}
      >
        {label}
      </Typography>

      <Box sx={{ flex: 1 }}>{value}</Box>
    </Box>
  );
}
