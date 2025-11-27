import { Box, FormLabel, OutlinedInput } from "@mui/material";
import "../baseForm.css";

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
    <Box className={`form-field-box ${horizontal ? "horizontal" : ""}`}>
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
        className="form-field-input"
      />
    </Box>
  );
}
