import {
  Dialog,
  DialogTitle,
  DialogContent,
  Typography,
  IconButton,
  TextField,
  InputAdornment,
  Box,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import SearchIcon from "@mui/icons-material/Search";
import { useMemo, useState } from "react";
import type { IssueMemberDto } from "../../type/type";

interface ParticipantModalListProps {
  open: boolean;
  onClose: () => void;
  members: IssueMemberDto[];
}

export default function ParticipantListModal({
  open,
  onClose,
  members,
}: ParticipantModalListProps) {
  const [searchValue, setSearchValue] = useState("");

  /** 검색 필터
   * - searchValue 검색어를 전부 소문자로 변환하여 비교
   * - memberName 또는 departmentName 중 하나라도 검색어를 포함하면 포함
   * - useMemo: members 또는 searchValue가 변경될 때만 재계산
   */
  const filteredMembers = useMemo(() => {
    const lower = searchValue.toLowerCase();
    const filtered = members.filter((m) => {
      const name = m.memberName.toLowerCase();
      const dept = (m.departmentName ?? "").toLowerCase();

      return name.includes(lower) || dept.includes(lower);
    });
    return filtered.sort((a, b) => Number(b.isHost) - Number(a.isHost)); // 주관자는 맨 위로.
  }, [members, searchValue]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      disableRestoreFocus
      slotProps={{
        paper: {
          sx: {
            width: "400px",
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
        <Typography variant="h6" sx={{ fontWeight: 700 }} component="span">
          참여자 리스트
        </Typography>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent>
        {/* 검색 */}
        <TextField
          fullWidth
          placeholder="이름 또는 부서명을 입력해주세요"
          size="small"
          sx={{ mb: 3 }}
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            },
          }}
        />
        {/* 참여자 목록 */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 2,
            height: "calc(47vh - 100px)", // TextField와 제목 공간을 제외하고 대략적인 높이 고정
            overflowY: "auto",
          }}
        >
          {filteredMembers.length > 0 ? (
            filteredMembers.map((member) => (
              <Box
                key={member.memberId}
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  p: 2,
                  border: 1,
                  borderColor: "divider",
                  borderRadius: 1.5,
                }}
              >
                <Box>
                  <Typography sx={{ fontWeight: 600, mb: 0.5 }}>
                    {member.memberName}
                    {member.isHost && (
                      <span
                        className="ml-2 px-2 py-0.5 text-xs font-bold rounded-sm"
                        style={{
                          backgroundColor: "#FFE0B2",
                          color: "#E65100",
                        }}
                      >
                        주관자
                      </span>
                    )}
                  </Typography>
                  <Typography sx={{ color: "text.secondary" }}>
                    {member.departmentName}
                  </Typography>
                </Box>

                <span
                  className={`px-3 py-1 text-sm font-semibold rounded-sm ${
                    member.isRead === true
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {member.isRead === true ? "확인" : "미확인"}
                </span>
              </Box>
            ))
          ) : (
            <Typography color="text.secondary" textAlign={"center"}>
              검색 결과가 없습니다.
            </Typography>
          )}
        </Box>
      </DialogContent>
    </Dialog>
  );
}
