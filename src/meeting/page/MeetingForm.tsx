import {
  Box,
  Button,
  TextField,
  Typography,
  Select,
  MenuItem,
  FormControl,
} from "@mui/material";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import DeleteIcon from "@mui/icons-material/Delete";
import PartMember from "../../issue/page/PartMember";
import type { MasterDataType } from "../../admin/setting/type/SettingType";
import { StaticDateTimePicker } from "@mui/x-date-pickers";
import dayjs, { Dayjs } from "dayjs";
import type { MeetingFormValues, MeetingMemberDto } from "../type/type";
import type { IssueIdTitle } from "../../issue/type/type";
import { useState } from "react";

interface MeetingFormProps {
  //useState로 관리 됐던 애들
  formData: MeetingFormValues;
  issues: IssueIdTitle[];
  categories: MasterDataType[];
  departments: MasterDataType[];
  // range: { startDate: Date; endDate: Date; key: string }[];
  isSaving: boolean;
  maxFileSize: number | null;
  allowedExtensions: string[] | null;

  //핸들러로 관리됐던 애들
  //   <K>: 제네릭 타입 변수
  // keyof: IssueFormValues 타입의 키들이 문자열 리터럴 유니온 타입으로 변환 "title" | "department"
  // extends keyof IssueFormValues → K는 반드시 IssueFormValues 속성 중 하나여야 함
  onChangeFormData: <K extends keyof MeetingFormValues>(
    key: K,
    value: MeetingFormValues[K]
  ) => void;
  onIssueSelect: (selectedId: string) => void;
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onFileRemove: (idx: number) => void;
  onOpenFileInput: () => void;
  onDepartmentChange: (selected: string[]) => void;
  onChangeMembers: (members: MeetingMemberDto[]) => void;
  onSelectDateTime: (value: Dayjs | null) => void;
  onSubmit: () => void;
  mode: "create" | "update";
}

export default function MeetingForm({
  //부모에게 전달할 내용
  formData,
  issues,
  categories,
  departments,
  isSaving,
  maxFileSize,
  allowedExtensions,
  onIssueSelect,
  onChangeFormData,
  onFileUpload,
  onFileRemove,
  onOpenFileInput,
  onDepartmentChange,
  onChangeMembers,
  onSelectDateTime,
  onSubmit,
  mode,
}: MeetingFormProps) {
  // ================================================================================
  //                                     시간
  // ================================================================================

  const selected = dayjs(formData.startDate);

  const [selectedDay, setSelectedDay] = useState(selected.format("YYYY-MM-DD"));
  const [selectedTime, setSelectedTime] = useState(selected.format("HH:mm"));

  //날짜/시간을 받아서 startDate를 갱신하는 공통 함수
  const updateStartDate = (day: string, time: string) => {
    // formData.startDate 최종 업데이트
    const combined = dayjs(`${day} ${time}`).format("YYYY-MM-DDTHH:mm:ss");
    onChangeFormData("startDate", combined);
  };

  const handleDateTimeChange = (value: Dayjs | null) => {
    if (!value) return;

    const day = value.format("YYYY-MM-DD");
    const time = value.format("HH:mm");

    setSelectedDay(day);
    setSelectedTime(time);

    // 부모에게 전달
    onSelectDateTime(value);
  };

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          gap: 3,
          p: 3,
          bgcolor: "#f5f5f5",
          minWidth: "1000px",
        }}
      >
        {/* 왼쪽 섹션 */}
        <Box
          sx={{
            flex: 1,
            bgcolor: "white",
            borderRadius: 2,
            p: 3,
            boxShadow: 1,
          }}
        >
          {/* 제목 */}
          <Box sx={{ mb: 3 }}>
            <Typography sx={{ fontWeight: 600, fontSize: "0.875rem", mb: 1 }}>
              제목
            </Typography>
            <TextField
              fullWidth
              placeholder="제목을 입력해주세요"
              value={formData.title}
              onChange={(e) => onChangeFormData("title", e.target.value)}
              size="small"
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: 1.5 } }}
            />
          </Box>

          {/* 본문 */}
          <Box sx={{ mb: 3 }}>
            <Typography sx={{ fontWeight: 600, fontSize: "0.875rem", mb: 1 }}>
              본문
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={10}
              placeholder="내용을 입력해주세요"
              value={formData.content}
              onChange={(e) => onChangeFormData("content", e.target.value)}
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: 1.5 } }}
            />
          </Box>

          {/* 첨부 파일 */}
          <Box sx={{ mb: 3 }}>
            <Typography sx={{ fontWeight: 600, fontSize: "0.875rem", mb: 1 }}>
              첨부 파일
            </Typography>

            <input
              type="file"
              multiple
              id="fileUpload"
              style={{ display: "none" }}
              onChange={onFileUpload}
            />

            <Box
              sx={{
                border: "2px dashed #d0d0d0",
                borderRadius: 2,
                p: 3,
                textAlign: "center",
                cursor: "pointer",
                transition: "all 0.2s",
                "&:hover": {
                  bgcolor: "#fafafa",
                  borderColor: "#999",
                },
              }}
              onClick={onOpenFileInput}
            >
              <UploadFileIcon sx={{ fontSize: 48, color: "#9e9e9e", mb: 1 }} />
              <Typography
                sx={{ fontSize: "0.875rem", fontWeight: 500, mb: 0.5 }}
              >
                Choose files
              </Typography>
              <Typography
                sx={{ fontSize: "0.875rem", fontWeight: 500, mb: 0.5 }}
              >
                최대 파일 크기: {maxFileSize}MB, 허용 확장자:{" "}
                {allowedExtensions?.join(", ")}
              </Typography>
            </Box>

            {formData.file && formData.file.length > 0 && (
              <Box sx={{ mt: 2 }}>
                {formData.file.map((file, idx) => (
                  <Box
                    key={idx}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      p: 1.5,
                      bgcolor: "#f5f5f5",
                      borderRadius: 1.5,
                      mb: 1,
                    }}
                  >
                    <Box
                      sx={{ display: "flex", alignItems: "center", gap: 1.5 }}
                    >
                      <Box
                        sx={{
                          width: 40,
                          height: 40,
                          bgcolor: "#e0e0e0",
                          borderRadius: 1,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Typography sx={{ fontSize: "1.2rem" }}>📄</Typography>
                      </Box>
                      <Box>
                        <Typography
                          sx={{ fontSize: "0.875rem", fontWeight: 500 }}
                        >
                          {file.name}
                        </Typography>
                        <Typography
                          sx={{ fontSize: "0.75rem", color: "text.secondary" }}
                        >
                          {(file.size / 1024 / 1024).toFixed(1)}MB · Uploading
                        </Typography>
                      </Box>
                    </Box>
                    <Button
                      size="small"
                      onClick={() => onFileRemove(idx)}
                      sx={{ minWidth: "auto", p: 1 }}
                    >
                      <DeleteIcon fontSize="small" />
                    </Button>
                  </Box>
                ))}
              </Box>
            )}
          </Box>
        </Box>

        {/* 오른쪽 섹션 */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            height: "100%",
          }}
        >
          <Box
            sx={{
              height: 950,
              width: 380,
              display: "flex",
              flexDirection: "column",
              gap: 2,
              bgcolor: "white",
            }}
          >
            {/* 상태 */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 2,
                borderRadius: 2,
                px: 2,
                mt: 2,
              }}
            >
              <Typography
                sx={{ fontWeight: 600, fontSize: "0.875rem", width: "80px" }}
              >
                상태
              </Typography>
              <Select
                fullWidth
                size="small"
                value={formData.status}
                onChange={(e) => onChangeFormData("status", e.target.value)}
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: 1.5 } }}
              >
                <MenuItem value="PLANNED">진행전</MenuItem>
                <MenuItem value="IN_PROGRESS">진행중</MenuItem>
                <MenuItem value="COMPLETED">진행 완료</MenuItem>
              </Select>
            </Box>

            {/* 주관자 */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 2,
                borderRadius: 2,
                px: 2,
              }}
            >
              <Typography
                sx={{ fontWeight: 600, fontSize: "0.875rem", width: "80px" }}
              >
                주관자
              </Typography>
              <TextField
                disabled
                fullWidth
                size="small"
                value={formData.host}
                onChange={(e) => onChangeFormData("host", e.target.value)}
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: 1.5 } }}
              />
            </Box>

            {/* 관련 이슈 */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 2,
                borderRadius: 2,
                px: 2,
              }}
            >
              <Typography
                sx={{ fontWeight: 600, fontSize: "0.875rem", width: "80px" }}
              >
                관련 이슈
              </Typography>
              <FormControl fullWidth size="small">
                <Select
                  value={formData.issue ?? ""}
                  displayEmpty
                  onChange={(e) => {
                    onIssueSelect(e.target.value); // 상위 컴포넌트에 숫자로 전달
                  }}
                >
                  {issues.map((i) => (
                    <MenuItem key={i.id} value={i.id}>
                      {i.title}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            {/* 시작일/마감일 + 달력 */}
            <Box sx={{ borderRadius: 2, p: 2 }}>
              <Box sx={{ mt: 2 }}>
                {/* 달력 (항상 표시) */}
                <StaticDateTimePicker
                  ampm={false}
                  value={dayjs(`${selectedDay} ${selectedTime}`)}
                  onChange={handleDateTimeChange}
                  slots={{ toolbar: () => null }}
                  slotProps={{ actionBar: { actions: [] } }}
                />
              </Box>
              <Box
                sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}
              >
                <Box>
                  <Typography
                    sx={{ fontWeight: 600, fontSize: "0.875rem", mb: 1.5 }}
                  >
                    시작일
                  </Typography>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="0000-00-00"
                    value={selectedDay}
                    onChange={(e) => {
                      const day = e.target.value;
                      setSelectedDay(day);
                      updateStartDate(day, selectedTime); //시간이랑 합쳐서 formData에 반영
                    }}
                  />
                </Box>
                <Box>
                  <Typography
                    sx={{ fontWeight: 600, fontSize: "0.875rem", mb: 1.5 }}
                  >
                    시작시간
                  </Typography>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="00:00"
                    value={selectedTime}
                    onChange={(e) => {
                      const time = e.target.value;
                      setSelectedTime(time);

                      updateStartDate(selectedDay, time);
                    }}
                  />
                </Box>
              </Box>
            </Box>

            {/* 마감일 */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 2,
                borderRadius: 2,
                px: 2,
              }}
            >
              <Typography
                sx={{ fontWeight: 600, fontSize: "0.875rem", width: "80px" }}
              >
                마감일
              </Typography>
              <TextField
                disabled
                fullWidth
                size="small"
                placeholder="진행 완료 시 작성"
                value={formData.endDate ?? ""}
                onChange={(e) => onChangeFormData("endDate", e.target.value)}
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: 1.5 } }}
              />
            </Box>

            {/* 카테고리 */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 2,
                borderRadius: 2,
                px: 2,
              }}
            >
              <Typography
                sx={{ fontWeight: 600, fontSize: "0.875rem", width: "80px" }}
              >
                카테고리
              </Typography>
              <FormControl fullWidth size="small">
                <Select
                  value={formData.categoryId}
                  onChange={(e) =>
                    onChangeFormData("categoryId", e.target.value)
                  }
                  displayEmpty
                  sx={{ borderRadius: 1.5 }}
                >
                  {categories.map((cat) => (
                    <MenuItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            {/* 관련 부서 */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 2,
                borderRadius: 2,
                px: 2,
              }}
            >
              <Typography
                sx={{ fontWeight: 600, fontSize: "0.875rem", width: "80px" }}
              >
                관련 부서
              </Typography>
              <FormControl fullWidth size="small">
                <Select
                  multiple
                  value={formData.departmentIds}
                  onChange={(e) =>
                    onDepartmentChange(e.target.value as string[])
                  }
                  sx={{ borderRadius: 1.5 }}
                >
                  {departments.map((dep) => (
                    <MenuItem key={dep.id} value={dep.id}>
                      {dep.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            {/* 참여자 */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 2,
                borderRadius: 2,
                px: 2,
              }}
            >
              <Typography
                sx={{ fontWeight: 600, fontSize: "0.875rem", width: "80px" }}
              >
                참여자
              </Typography>
              <PartMember
                onChangeMembers={onChangeMembers}
                initialMembers={formData.members}
                mode={mode}
              />
            </Box>
          </Box>

          {/* 등록 버튼 */}
          <Box sx={{ display: "flex" }}>
            <Box sx={{ width: 250 }}></Box>
            <Button
              variant="contained"
              onClick={onSubmit}
              sx={{
                width: 100,
                p: 2,
                m: 3,
                fontWeight: 600,
                borderRadius: 1.5,
                "&:hover": { boxShadow: 3 },
              }}
            >
              {isSaving ? "등록 중..." : "등록"}
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
