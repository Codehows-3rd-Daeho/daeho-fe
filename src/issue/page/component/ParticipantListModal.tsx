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

interface Participant {
  id: number;
  name: string;
  department: string;
  status: "available" | "unavailable";
}

interface ParticipantModalListProps {
  open: boolean;
  onClose: () => void;
  participants: Participant[];
}

export default function ParticipantListModal({
  open,
  onClose,
  participants,
}: ParticipantModalListProps) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
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
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />

        {/* 참여자 목록 */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {participants.map((participant) => (
            <Box
              key={participant.id}
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
                  {participant.name}
                </Typography>
                <Typography sx={{ color: "text.secondary" }}>
                  {participant.department}
                </Typography>
              </Box>

              <span
                className={`px-3 py-1 text-sm font-semibold rounded-sm ${
                  participant.status === "available"
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {participant.status === "available" ? "확인" : "미확인"}
              </span>
            </Box>
          ))}
        </Box>
      </DialogContent>
    </Dialog>
  );
}
