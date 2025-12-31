import {
  Box,
  Button,
  Dialog,
  Typography,
  Badge,
  IconButton,
  TextField,
  InputAdornment,
} from "@mui/material";
import { useCallback, useState } from "react";
import CloseIcon from "@mui/icons-material/Close";
import SearchIcon from "@mui/icons-material/Search";
import CheckIcon from "@mui/icons-material/Check";
import FilterListIcon from "@mui/icons-material/FilterList";
import { getPartMemberList } from "../../admin/member/api/MemberApi";
import {
  getCategory,
  getDepartment,
} from "../../admin/setting/api/MasterDataApi";
import type { ApiError } from "../../config/httpClient";
import type { FilterDto } from "./type";

interface FilterProps {
  value: FilterDto;
  onChange: (filter: FilterDto) => void;
  excludeSections?: (keyof typeof sectionKeyMap)[]; // 제외할 섹션
  type?: "issue" | "meeting";
}

type IssueArrayFilterKey =
  | "departmentIds"
  | "categoryIds"
  | "hostIds"
  | "participantIds"
  | "statuses";

const sectionKeyMap: Record<string, IssueArrayFilterKey> = {
  부서: "departmentIds",
  카테고리: "categoryIds",
  주관자: "hostIds",
  참여자: "participantIds",
  상태: "statuses",
};

interface FilterOption {
  id: string;
  name: string;
  subLabel?: string; // 부서명, 직급 등
}

export default function Filter({
  value,
  onChange,
  excludeSections,
  type,
}: FilterProps) {
  const [open, setOpen] = useState(false);
  const [activeSection, setActiveSection] =
    useState<keyof typeof sectionKeyMap>("카테고리");
  const [searchQuery, setSearchQuery] = useState("");
  const [options, setOptions] = useState<FilterOption[]>([]);
  const [tempFilter, setTempFilter] = useState<FilterDto>(value);

  const loadOptions = useCallback(
    async (section: keyof typeof sectionKeyMap) => {
      try {
        let mappedData: FilterOption[] = [];

        switch (section) {
          case "부서": {
            const data = await getDepartment();
            mappedData = data.map((d) => ({
              id: String(d.id),
              name: d.name,
            }));
            break;
          }
          case "카테고리": {
            const data = await getCategory();
            mappedData = data.map((c) => ({
              id: String(c.id),
              name: c.name,
            }));
            break;
          }
          case "주관자":
          case "참여자": {
            const data = await getPartMemberList();
            mappedData = data.map((m) => ({
              id: String(m.id),
              name: `${m.name} ${m.jobPositionName ?? ""}`.trim(),
              subLabel: m.department,
            }));
            break;
          }
          case "상태": {
            // 모든 페이지 공통 상태 (진행중, 진행완료)
            const commonStatus = [
              { id: "IN_PROGRESS", name: "진행중" },
              { id: "COMPLETED", name: "진행완료" },
            ];

            //  type이 'meeting'일 때만 '진행전'을 배열 맨 앞에 추가
            mappedData =
              type === "meeting"
                ? [{ id: "PLANNED", name: "진행전" }, ...commonStatus]
                : commonStatus;
            break;
          }
        }

        setOptions(mappedData);
      } catch (error) {
        const apiError = error as ApiError;
        alert(
          apiError.response?.data?.message ?? "조회 중 오류가 발생했습니다."
        );
      }
    },
    [type]
  );

  const filteredOptions = options.filter((o) => o.name.includes(searchQuery));

  /** 선택 토글 */
  const toggle = (key: IssueArrayFilterKey, id: string) => {
    const prev = tempFilter[key] ?? [];
    const next = prev.includes(id)
      ? prev.filter((v) => v !== id)
      : [...prev, id];

    setTempFilter({ ...tempFilter, [key]: next });
  };

  const isSelected = (key: IssueArrayFilterKey, id: string) =>
    tempFilter[key]?.includes(id) ?? false;

  const getCount = (section: keyof typeof sectionKeyMap) =>
    tempFilter[sectionKeyMap[section]]?.length ?? 0;

  const handleToggle = (section: keyof typeof sectionKeyMap, id: string) =>
    toggle(sectionKeyMap[section], id);

  //  현재 적용된 필터의 총 개수 (keyword, startDate, endDate 제외한 ID 리스트들)
  const appliedCount = [
    value.departmentIds,
    value.categoryIds,
    value.hostIds,
    value.participantIds,
    value.statuses,
  ].reduce((acc, curr) => acc + (curr?.length || 0), 0);

  const isAnyFilterApplied = appliedCount > 0;

  return (
    <Box sx={{ p: 2 }}>
      {/* 필터 버튼 */}
      <Badge
        badgeContent={appliedCount}
        color="warning"
        invisible={!isAnyFilterApplied} // 선택된 게 없으면 배지 숨김
      >
        <Button
          variant="outlined"
          startIcon={<FilterListIcon />}
          onClick={() => {
            setSearchQuery("");
            setTempFilter(value);
            setOpen(true);
            setActiveSection("부서");
            loadOptions("부서");
          }}
          sx={{
            py: 0.95,
            color: "black",
            borderColor: "black",
            "&:hover": {
              borderColor: "black",
            },
          }}
        >
          Filter
        </Button>
      </Badge>

      {/* 필터 모달 */}
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        maxWidth={false}
        PaperProps={{
          sx: {
            width: "90vw",
            maxWidth: 700,
            height: 680,
            borderRadius: 4,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          },
        }}
      >
        {/* 헤더 */}
        <Box
          sx={{
            p: 3,
            borderBottom: "1px solid #e0e0e0",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexShrink: 0,
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            필터
          </Typography>
          <IconButton
            onClick={() => setOpen(false)}
            sx={{
              "&:hover": {
                bgcolor: "#f5f5f5",
              },
            }}
          >
            <CloseIcon />
          </IconButton>
        </Box>

        {/* 메인 컨텐츠 */}
        <Box sx={{ display: "flex", flex: 1, overflow: "hidden" }}>
          {/* 왼쪽: 카테고리 목록 */}
          <Box
            sx={{
              width: 208,
              borderRight: "1px solid #e0e0e0",
              flexShrink: 0,
              overflowY: "auto",
            }}
          >
            {["부서", "카테고리", "주관자", "참여자", "상태"]
              .filter((section) => !excludeSections?.includes(section))
              .map((section) => {
                const count = getCount(section);

                return (
                  <Button
                    key={section}
                    fullWidth
                    onClick={() => {
                      setActiveSection(section);
                      setSearchQuery("");
                      loadOptions(section);
                    }}
                    sx={{
                      justifyContent: "space-between",
                      px: 2,
                      py: 2,
                      textAlign: "left",
                      fontWeight: 600,
                      fontSize: "1rem",
                      textTransform: "none",
                      borderRadius: 0,
                      borderRight:
                        activeSection === section
                          ? "4px solid #2196f3"
                          : "none",
                      bgcolor:
                        activeSection === section ? "#e3f2fd" : "transparent",
                      color: activeSection === section ? "#2196f3" : "#333",
                      "&:hover": {
                        bgcolor:
                          activeSection === section ? "#e3f2fd" : "#f5f5f5",
                      },
                    }}
                  >
                    <span>{section}</span>
                    {count > 0 && (
                      <Badge
                        badgeContent={count}
                        sx={{
                          "& .MuiBadge-badge": {
                            bgcolor:
                              activeSection === section ? "#2196f3" : "#e0e0e0",
                            color: activeSection === section ? "white" : "#666",
                            fontWeight: 700,
                            fontSize: "0.7rem",
                            minWidth: 20,
                            height: 20,
                          },
                        }}
                      />
                    )}
                  </Button>
                );
              })}
          </Box>

          {/* 오른쪽: 필터 옵션 */}
          <Box
            sx={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
            }}
          >
            {/* 검색 */}
            <Box
              sx={{
                p: 3,
                flexShrink: 0,
              }}
            >
              <TextField
                fullWidth
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="검색어를 입력해주세요"
                size="small"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                  sx: { borderRadius: 3 },
                }}
              />
            </Box>

            {/* 옵션 목록 */}
            <Box sx={{ flex: 1, overflowY: "auto", px: 3, pb: 2 }}>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                {filteredOptions.map((option) => (
                  <Box
                    key={option.id}
                    onClick={() => handleToggle(activeSection, option.id)}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      p: 2,
                      border: "1px solid #e0e0e0",
                      borderRadius: 3,
                      cursor: "pointer",
                      "&:hover": { bgcolor: "#f5f5f5" },
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                      <Box
                        sx={{
                          width: 28,
                          height: 28,
                          border: "2px solid",
                          borderColor: isSelected(
                            sectionKeyMap[activeSection],
                            option.id
                          )
                            ? "#424242"
                            : "#d0d0d0",
                          borderRadius: 1,
                          bgcolor: isSelected(
                            sectionKeyMap[activeSection],
                            option.id
                          )
                            ? "#424242"
                            : "transparent",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        {isSelected(
                          sectionKeyMap[activeSection],
                          option.id
                        ) && <CheckIcon sx={{ color: "#fff", fontSize: 18 }} />}
                      </Box>

                      <Typography fontWeight={600}>{option.name}</Typography>
                    </Box>

                    {option.subLabel && (
                      <Typography fontSize="0.875rem" color="#999">
                        {option.subLabel}
                      </Typography>
                    )}
                  </Box>
                ))}
              </Box>
            </Box>
          </Box>
        </Box>
        {/* 하단 버튼 영역 */}
        <Box
          sx={{
            p: 2,
            borderTop: "1px solid #e0e0e0",
            display: "flex",
            justifyContent: "flex-end",
            gap: 1.5,
            flexShrink: 0,
            bgcolor: "#fff",
          }}
        >
          {/* 초기화 버튼 */}
          <Button
            variant="text"
            color="error"
            onClick={() => {
              setTempFilter({
                keyword: value.keyword, // 키워드는 유지
                departmentIds: [],
                categoryIds: [],
                hostIds: [],
                participantIds: [],
                statuses: [],
              });
            }}
          >
            필터 초기화
          </Button>
          <Button variant="outlined" onClick={() => setOpen(false)}>
            취소
          </Button>

          <Button
            variant="contained"
            onClick={() => {
              onChange(tempFilter);
              setOpen(false);
            }}
          >
            필터 적용
          </Button>
        </Box>
      </Dialog>
    </Box>
  );
}
