import { Box, TextField, Typography } from "@mui/material";
import type { FC } from "react";

interface DateRangePickerProps {
  startDate: string;
  endDate: string;
  onStartDateChange: (value: string) => void;
  onEndDateChange: (value: string) => void;
}

const DateFilter: FC<DateRangePickerProps> = ({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
}) => {
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
      <TextField
        type="date"
        size="small"
        value={startDate}
        onChange={(e) => onStartDateChange(e.target.value)}
        sx={{
          "& .MuiOutlinedInput-root": {
            borderRadius: "12px",
          },

          "& .MuiOutlinedInput-notchedOutline": {
            borderColor: "#94a3b8",
          },
        }}
      />
      <Typography>~</Typography>
      <TextField
        type="date"
        size="small"
        value={endDate}
        onChange={(e) => onEndDateChange(e.target.value)}
        sx={{
          "& .MuiOutlinedInput-root": {
            borderRadius: "12px",
          },

          "& .MuiOutlinedInput-notchedOutline": {
            borderColor: "#94a3b8",
          },
        }}
      />
    </Box>
  );
};

export default DateFilter;
