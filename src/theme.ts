// theme.ts
import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: {
      main: "#1c468d",
    },
    secondary: {
      main: "#dc004e",
    },
  },
  // typography: {
  //   fontFamily: "Roboto, Arial, sans-serif",
  //   fontSize: 20, // 전체 기본 폰트 크기
  //   // body1, body2 등 세부 조절도 가능
  //   // body1: {
  //   //   fontSize: '1rem',
  //   // },
  //   // body2: {
  //   //   fontSize: '0.875rem',
  //   // },
  // },
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
            border: "2px solid #1976d2",
          },
        },
      },
    },
    // MuiButton: {
    //   styleOverrides: {
    //     root: {
    //       fontSize: "20px", // 버튼 폰트 크기
    //       fontWeight: 500, // 폰트 두께 (선택)
    //       textTransform: "none", // 대문자 변환 비활성화
    //     },
    //   },
    // },
  },
});

export default theme;
