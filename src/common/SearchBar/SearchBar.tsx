import { useState } from "react";
import { TextField, InputAdornment } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";

interface SearchBarProps {
  onSearch: (value: string) => void; // 부모에게 최종 검색어 전달
  placeholder?: string;
}

export const SearchBar = ({ placeholder }: SearchBarProps) => {
  const [localValue, setLocalValue] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setLocalValue(val); // 로컬 상태만 바꿔서 타이핑은 가볍게!
  };

  return (
    <TextField
      size="small"
      placeholder={placeholder}
      value={localValue}
      onChange={handleChange}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <SearchIcon />
          </InputAdornment>
        ),
      }}
    />
  );
};
