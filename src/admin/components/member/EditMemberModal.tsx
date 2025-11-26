import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useMemberModal } from "./useMemberModal"; // Custom Hook 사용
import MemberForm from "./MemberForm";

interface EditMemberModalProps {
  open: boolean;
  onClose: () => void;
  memberId: number; // 수정할 회원의 ID
}

export default function EditMemberModal({
  open,
  onClose,
  memberId,
}: EditMemberModalProps) {
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
  } = useMemberModal(memberId); // memberId를 넘겨서 회원 정보 불러오기

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        회원 수정
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
          isDuplicate={false} // 수정에서는 중복 체크가 필요 없음
          showPassword={showPassword}
          setShowPassword={setShowPassword}
          validateField={validateField}
        />
      </DialogContent>
    </Dialog>
  );
}
