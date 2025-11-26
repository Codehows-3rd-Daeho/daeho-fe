import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useMemberModal } from "./useMemberModal"; // Custom Hook 사용
import MemberForm from "./MemberForm";

interface CreateMemberModalProps {
  open: boolean;
  onClose: () => void;
}

export default function CreateMemberModal({
  open,
  onClose,
}: CreateMemberModalProps) {
  const {
    department,
    jobPosition,
    member,
    errors,
    showPassword,
    setShowPassword,
    handleChange,
    validateField,
    handleSubmit,
  } = useMemberModal(); // 회원 관련 상태와 함수들

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        회원 등록
        <IconButton aria-label="close" onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <MemberForm
          member={member || {}}
          department={department}
          jobPosition={jobPosition}
          onChange={handleChange}
          onSubmit={handleSubmit}
          errors={errors}
          isDuplicate={false} // 등록이므로 중복 체크는 필요 없음
          showPassword={showPassword}
          setShowPassword={setShowPassword}
          validateField={validateField}
        />
      </DialogContent>
    </Dialog>
  );
}
