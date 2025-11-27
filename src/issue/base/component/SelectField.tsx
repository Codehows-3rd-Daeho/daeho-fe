import {
  Box,
  FormLabel,
  Select,
  MenuItem,
  type SelectChangeEvent,
} from "@mui/material";

interface SelectFieldProps {
  label: string;
  name: string;
  value: string | string[] | number[]; //formdata의 속성에 담기는 값, 상태 -> string, 카테고리 및 참여자 -> number 변환 호환
  onChange: (event: SelectChangeEvent<string | string[] | number[]>) => void;
  required?: boolean;
  inputWidth?: string | number;
  horizontal?: boolean;
  options: { value: number | string; label: string }[]; // 상태 -> string, 카테고리 및 참여자 -> number 호환
  multiple?: boolean; // 다중 선택 여부
}

export default function SelectField({
  label,
  name,
  value,
  onChange,
  required = false,
  inputWidth,
  horizontal = false,
  options,
  multiple = false,
}: SelectFieldProps) {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: horizontal ? "row" : "column",
        alignItems: horizontal ? "center" : "flex-start",
        gap: 1,
        mb: 2,
      }}
    >
      <FormLabel
        htmlFor={name}
        required={required}
        sx={{ minWidth: horizontal ? 100 : "auto" }}
      >
        {label}
      </FormLabel>

      <Select
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        multiple={multiple}
        sx={{
          width: inputWidth || "350px",
          backgroundColor: "#ffffff", // 배경 흰색
        }}
      >
        {options.map((opt) => (
          <MenuItem key={opt.value} value={opt.value}>
            {opt.label}
          </MenuItem>
        ))}
      </Select>
    </Box>
  );
}
