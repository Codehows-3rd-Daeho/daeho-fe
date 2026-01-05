import { Box, Typography } from "@mui/material";

interface SpinnerProps {
  message?: string;
}

export default function Spinner({ message }: SpinnerProps) {
  return (
    <Box
      sx={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(255, 255, 255, 0.7)",
        zIndex: 10,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        borderRadius: 2,
      }}
    >
      <div className="w-10 h-10 mb-1 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin"></div>
      {message && <Typography>{message}</Typography>}
    </Box>
  );
}
