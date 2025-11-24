import { Box, FormLabel, OutlinedInput } from "@mui/material";

interface FormFieldProps {
  label: string;
  name: string;
  value: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  required: boolean;
  placeholder?: string;
  inputWidth?: string | number; // 너비
  inputHeight?: string | number; // 높이
  horizontal?: boolean; // 가로 정렬 여부
}

export default function FormField({
  label,
  name,
  value,
  onChange,
  required = false,
  placeholder,
  inputWidth,
  inputHeight,
  horizontal = false, // 가로 정렬 여부
}: FormFieldProps) {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: horizontal ? "row" : "column",
        alignItems: horizontal ? "center" : "flex-start",
        gap: 1, // 라벨과 입력란 사이 간격
        mb: 2, // 아래 여백
      }}
    >
      <FormLabel
        htmlFor={name}
        required={required}
        sx={{ minWidth: horizontal ? "100px" : "auto" }} // 가로일 때 라벨 최소 너비
      >
        {label}
      </FormLabel>
      <OutlinedInput
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete={name}
        required={required}
        sx={{
          width: inputWidth || "600px", // 기본 fullWidth
          height: inputHeight || "60px", // 기본 auto
        }}
      />
    </Box>
  );
}
