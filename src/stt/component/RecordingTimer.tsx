import useRecordingStore from "../../store/useRecordingStore";
import { Typography } from "@mui/material";

interface RecordingTimerProps {
  sttId: number;
}

const formatTime = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(
    remainingSeconds
  ).padStart(2, "0")}`;
};

export default function RecordingTimer({ sttId }: RecordingTimerProps) {
  const recordingTime = useRecordingStore(
    (state) => state.sessionStates.get(sttId)?.recordingTime ?? 0
  );

  return (
    <Typography variant="h4" sx={{ mb: 2, fontFamily: "monospace" }}>
      {formatTime(recordingTime)}
    </Typography>
  );
}
