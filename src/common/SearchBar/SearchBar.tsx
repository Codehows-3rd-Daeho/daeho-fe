import { useState } from "react";
import { TextField, InputAdornment } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";

interface SearchBarProps {
  onSearch: (value: string) => void;
  placeholder?: string;
}
export const SearchBar = ({ onSearch, placeholder }: SearchBarProps) => {
  const [localValue, setLocalValue] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setLocalValue(val);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      onSearch(localValue);
    }
  };

  return (
    <TextField
      size="small"
      placeholder={placeholder}
      value={localValue}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
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
