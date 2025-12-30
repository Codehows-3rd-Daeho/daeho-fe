import { Button } from "@mui/material";
import type { AddButtonProps } from "./type";

export const AddButton = ({ onClick }: AddButtonProps) => {
  return (
    <Button color="primary" variant="contained" onClick={onClick}>
      등록
    </Button>
  );
};
