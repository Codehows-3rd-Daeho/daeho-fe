import { Box, ToggleButton, ToggleButtonGroup } from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import type { Props } from "./type";
import type React from "react";
import ViewKanbanIcon from "@mui/icons-material/ViewKanban";
import FormatListBulletedIcon from "@mui/icons-material/FormatListBulleted";

export const Toggle = ({ options }: Props) => {
  const navigate = useNavigate();
  const location = useLocation();

  const currentValue =
    options.find((opt) => location.pathname.includes(opt.value))?.value ||
    options[0].value;

  const handleChange = (_: React.MouseEvent<HTMLElement>, newValue: string) => {
    if (!newValue) return;
    const selected = options.find((o) => o.value === newValue);
    if (selected) navigate(selected.path);
  };

  return (
    <Box>
      <ToggleButtonGroup
        value={currentValue}
        exclusive
        onChange={handleChange}
        size="small"
        sx={{
          backgroundColor: "transparent",
          border: "1px solid #e2e8f0",
          borderRadius: "12px",
          "& .MuiToggleButton-root": {
            border: "none",
            borderRadius: "8px",
            px: 3,
            py: 1.2,
            gap: 1,
            color: "#94a3b8",
            fontWeight: 600,
            fontSize: "0.95rem",
            textTransform: "none",
            transition: "all 0.2s ease",
            "&:hover": {
              backgroundColor: "#f8fafc",
            },
          },
          "& .Mui-selected": {
            backgroundColor: "#f1f5f9 !important",
            color: "#1e293b !important",
            fontWeight: 700,
          },
          "& .MuiSvgIcon-root": {
            fontSize: "1.1rem",
          },
        }}
      >
        <ToggleButton value="kanban">
          <ViewKanbanIcon />
          Board
        </ToggleButton>

        <ToggleButton value="list">
          <FormatListBulletedIcon />
          List
        </ToggleButton>
      </ToggleButtonGroup>
    </Box>
  );
};
