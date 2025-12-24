// theme.ts
import { createTheme } from "@mui/material/styles";
import "@mui/x-data-grid/themeAugmentation";

const theme = createTheme({
  palette: {
    primary: {
      main: "#1c468d",
    },
    secondary: {
      main: "#dc004e",
    },
    action: {
      hover: "#edf0f6", // hover 기본 색
      selected: "#dce4f2", // 선택된 메뉴 색
    },
  },

  components: {
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          // 기본 테두리
          "& fieldset": {
            border: "1px solid #000",
          },
          // 포커스 시 테두리
          "&.Mui-focused fieldset": {
            border: "2px solid #1976d2",
          },
          // 마우스 hover 시 테두리
          "&:hover .MuiOutlinedInput-notchedOutline": {
            border: "2px solid #4b6485",
          },
          // 마우스 hover 시 배경색
          "&:hover": {
            backgroundColor: "#edf0f6",
          },
        },
      },
    },
    MuiDataGrid: {
      styleOverrides: {
        root: {
          "& .MuiDataGrid-row:hover": {
            backgroundColor: "#edf0f6",
          },
          "& .MuiDataGrid-row.Mui-selected": {
            backgroundColor: "#dce4f2",
          },
          "& .MuiDataGrid-row.Mui-selected:hover": {
            backgroundColor: "#cfd9ec",
          },
        },
      },
    },
  },
});

export default theme;
