import { Box, ToggleButton, ToggleButtonGroup } from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import type { Props } from "./type";
import type React from "react";

export const Toggle = ({ options }: Props) => {
  const navigate = useNavigate();
  const location = useLocation();

  // 현재 경로에서 자동으로 선택값 추출
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
      >
        {options.map((opt) => (
          <ToggleButton key={opt.value} value={opt.value}>
            {opt.label}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>
    </Box>
  );
};
