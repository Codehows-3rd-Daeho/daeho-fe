import { Box, IconButton, Typography } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { getFileInfo } from "../../common/commonFunction";

interface Props {
  files: File[];
  onRemove: (index: number) => void;
}

export default function TempFileList({ files, onRemove }: Props) {
  if (!files.length) return null;

  return (
    <>
      {files.map((file, idx) => {
        const { label, color } = getFileInfo(file.name);

        return (
          <Box
            key={idx}
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              p: 1.5,
              bgcolor: "#fafafa",
              borderRadius: 1.5,
              mb: 1,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <Box
                sx={{
                  width: 35,
                  height: 35,
                  bgcolor: color,
                  borderRadius: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: "0.75rem",
                }}
              >
                {label}
              </Box>

              <Typography sx={{ fontSize: "0.875rem", fontWeight: 500 }}>
                {file.name}
              </Typography>
            </Box>

            <IconButton size="small" onClick={() => onRemove(idx)}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>
        );
      })}
    </>
  );
}
