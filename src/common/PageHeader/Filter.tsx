import React, { useState } from "react";
import {
  Box,
  Button,
  TextField,
  IconButton,
  Dialog,
  Typography,
  InputAdornment,
  Badge,
} from "@mui/material";
import {
  FilterList as FilterListIcon,
  Close as CloseIcon,
  Search as SearchIcon,
  Check as CheckIcon,
} from "@mui/icons-material";

interface FilterOption {
  id: string;
  name: string;
  department: string;
}

const MOCK_PARTICIPANTS: FilterOption[] = [
  { id: "1", name: "홍길동 대리", department: "개발1팀" },
  { id: "2", name: "홍길동 대리", department: "개발2팀" },
  { id: "3", name: "홍길동 대리", department: "디자인팀" },
];

export default function Filter() {
  const [showFilter, setShowFilter] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string[]>(["1"]);
  const [selectedOwner, setSelectedOwner] = useState<string[]>([]);
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>(
    []
  );
  const [selectedStatus, setSelectedStatus] = useState<string[]>([]);
  const [activeSection, setActiveSection] = useState("참여자");

  const handleToggle = (category: string, id: string) => {
    const setters: {
      [key: string]: React.Dispatch<React.SetStateAction<string[]>>;
    } = {
      카테고리: setSelectedCategory,
      주관자: setSelectedOwner,
      참여자: setSelectedParticipants,
      상태: setSelectedStatus,
    };

    const setter = setters[category];
    if (setter) {
      setter((prev) =>
        prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
      );
    }
  };

  const isSelected = (category: string, id: string) => {
    const selections: { [key: string]: string[] } = {
      카테고리: selectedCategory,
      주관자: selectedOwner,
      참여자: selectedParticipants,
      상태: selectedStatus,
    };
    return selections[category]?.includes(id) || false;
  };

  const getCount = (section: string) => {
    switch (section) {
      case "카테고리":
        return selectedCategory.length;
      case "주관자":
        return selectedOwner.length;
      case "참여자":
        return selectedParticipants.length;
      case "상태":
        return selectedStatus.length;
      default:
        return 0;
    }
  };

  const filteredParticipants = MOCK_PARTICIPANTS.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.department.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Box sx={{ p: 2 }}>
      {/* 필터 버튼 */}
      <Button
        variant="outlined"
        startIcon={<FilterListIcon />}
        onClick={() => setShowFilter(true)}
        sx={{
          textTransform: "none",
          color: "#444",
          "&:hover": {
            bgcolor: "#fafafa",
            borderColor: "#999",
          },
        }}
      >
        Filter
      </Button>

      {/* 필터 모달 */}
      <Dialog
        open={showFilter}
        onClose={() => setShowFilter(false)}
        maxWidth={false}
        PaperProps={{
          sx: {
            width: "90vw",
            maxWidth: 700,
            height: 500,
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
            onClick={() => setShowFilter(false)}
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
            {["부서", "카테고리", "주관자", "참여자", "상태"].map((section) => {
              const count = getCount(section);

              return (
                <Button
                  key={section}
                  fullWidth
                  onClick={() => setActiveSection(section)}
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
                      activeSection === section ? "4px solid #2196f3" : "none",
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
            <Box sx={{ flex: 1, overflowY: "auto", px: 3 }}>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                {filteredParticipants.map((participant) => (
                  <Box
                    key={participant.id}
                    onClick={() => handleToggle(activeSection, participant.id)}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      p: 2,
                      border: "1px solid #e0e0e0",
                      borderRadius: 3,
                      cursor: "pointer",
                      transition: "all 0.2s",
                      "&:hover": {
                        bgcolor: "#f5f5f5",
                      },
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 2.5,
                        flex: 1,
                      }}
                    >
                      <Box
                        sx={{
                          width: 28,
                          height: 28,
                          border: "2px solid",
                          borderColor: isSelected(activeSection, participant.id)
                            ? "#424242"
                            : "#d0d0d0",
                          borderRadius: 1,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          bgcolor: isSelected(activeSection, participant.id)
                            ? "#424242"
                            : "transparent",
                          flexShrink: 0,
                          transition: "all 0.2s",
                        }}
                      >
                        {isSelected(activeSection, participant.id) && (
                          <CheckIcon sx={{ fontSize: 20, color: "white" }} />
                        )}
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <Typography sx={{ fontWeight: 600, fontSize: "1rem" }}>
                          {participant.name}
                        </Typography>
                      </Box>
                    </Box>
                    <Typography
                      sx={{ fontSize: "0.875rem", color: "#999", ml: 2 }}
                    >
                      {participant.department}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Box>
          </Box>
        </Box>
      </Dialog>
    </Box>
  );
}
