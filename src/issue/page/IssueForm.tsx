import {
  Box,
  Button,
  TextField,
  Typography,
  Select,
  MenuItem,
  FormControl,
  IconButton,
} from "@mui/material";
import { DateRange } from "react-date-range";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import DeleteIcon from "@mui/icons-material/Delete";
import PartMember from "./PartMember";
import type { FileDto, IssueFormValues, IssueMemberDto } from "../type/type";
import type { MasterDataType } from "../../admin/setting/type/SettingType";
import { useEffect, useRef } from "react";
import { formatFileSize, getFileInfo } from "../../common/commonFunction";
import { useNavigate } from "react-router-dom";

interface IssueFormProps {
  formData: IssueFormValues;
  categories: MasterDataType[];
  departments: MasterDataType[];
  range: { startDate: Date; endDate: Date; key: string }[];
  isSaving: boolean;
  maxFileSize: number | null;
  allowedExtensions: string[] | null;

  //핸들러로 관리됐던 애들
  //   <K>: 제네릭 타입 변수
  issueFiles?: FileDto[];
  initialMembers?: IssueMemberDto[];
  //핸들러로 관리됐던 애들 <K>: 제네릭 타입 변수
  // keyof: IssueFormValues 타입의 키들이 문자열 리터럴 유니온 타입으로 변환 "title" | "department"
  // extends keyof IssueFormValues → K는 반드시 IssueFormValues 속성 중 하나여야 함
  onChangeFormData: <K extends keyof IssueFormValues>(
    key: K,
    value: IssueFormValues[K]
  ) => void;

  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onFileRemove: (idx: number) => void;
  onRemoveExistingFile?: (fileId: number) => void;
  onOpenFileInput: () => void;
  onDepartmentChange: (selected: string[]) => void;
  onChangeMembers: (members: IssueMemberDto[]) => void;
  onSelectRange: (ranges: {
    startDate: Date;
    endDate: Date;
    key: string;
  }) => void;
  onSubmit: () => void;
  mode: "create" | "update";
}

export default function IssueForm({
  //부모에게 전달 받을 내용
  formData,
  categories,
  departments,
  range,
  isSaving,
  maxFileSize,
  allowedExtensions,
  issueFiles,
  onChangeFormData,
  onFileUpload,
  onFileRemove,
  onOpenFileInput,
  onRemoveExistingFile,
  onDepartmentChange,
  onChangeMembers,
  onSelectRange,
  onSubmit,
  mode,
}: IssueFormProps) {
  const navigate = useNavigate();
  // 파일 개수 변화를 감지해 새로 추가된 파일만 강조하고, 파일 목록은 항상 최신 항목이 보이도록 자동 스크롤 처리
  const listRef = useRef<HTMLDivElement>(null);
  const fileLength = formData.file?.length ?? 0;
  const prevLengthRef = useRef<number>(fileLength);

  useEffect(() => {
    if (!listRef.current) return;
    listRef.current.scrollTop = listRef.current.scrollHeight;
    prevLengthRef.current = fileLength;
  }, [fileLength]);

  // 드래그 오버 시 브라우저 기본 동작 막기
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  // 드롭 시 파일 처리
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!e.dataTransfer.files || e.dataTransfer.files.length === 0) return;
    const filesArray = Array.from(e.dataTransfer.files);

    // 각 파일 검증 후 부모로 전달
    filesArray.forEach((file) => {
      if (
        allowedExtensions &&
        !allowedExtensions.includes(
          file.name.split(".").pop()?.toLowerCase() || ""
        )
      ) {
        alert(`허용되지 않은 확장자입니다: ${file.name}`);
        return;
      }
      const sizeMB = file.size / 1024 / 1024;
      if (maxFileSize && file.size / 1024 / 1024 > maxFileSize) {
        alert(
          `${
            file.name
          } 파일의 크기가 ${maxFileSize}MB를 초과했습니다.\n(현재: ${sizeMB.toFixed(
            2
          )}MB)`
        );
        return;
      }

      // 부모의 onFileUpload 호출
      const event = {
        target: { files: [file] },
      } as unknown as React.ChangeEvent<HTMLInputElement>;
      onFileUpload(event);
    });
  };

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          gap: 3,
          p: 3,
          bgcolor: "#f5f5f5",
          minWidth: 300,
          flexDirection: { xs: "column-reverse", md: "row" }, // 모바일: 세로(2,1), 데스크탑: 가로(1,2)
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
            minWidth: 150,
          }}
        >
          {/* 제목 */}
          <Box sx={{ mb: 3 }}>
            <Typography sx={{ fontWeight: 600, fontSize: "0.875rem", mb: 1 }}>
              제목
            </Typography>
            <TextField
              placeholder="제목을 입력해주세요"
              value={formData.title}
              onChange={(e) => onChangeFormData("title", e.target.value)}
              size="small"
              sx={{
                width: "100%",
                "& .MuiOutlinedInput-root": { borderRadius: 1.5 },
              }}
            />
          </Box>

          {/* 본문 */}
          <Box sx={{ mb: 3 }}>
            <Typography sx={{ fontWeight: 600, fontSize: "0.875rem", mb: 1 }}>
              본문
            </Typography>
            <TextField
              multiline
              rows={10}
              placeholder="내용을 입력해주세요"
              value={formData.content}
              onChange={(e) => onChangeFormData("content", e.target.value)}
              sx={{
                width: "100%",
                "& .MuiOutlinedInput-root": { borderRadius: 1.5 },
              }}
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
              accept={allowedExtensions?.map((e) => `.${e}`).join(",") ?? ""}
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
              onDrop={handleDrop}
              onDragOver={handleDragOver}
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
                최대 파일 크기: {maxFileSize}MB <br /> 허용 확장자:{" "}
                {allowedExtensions?.join(", ")}
              </Typography>
            </Box>

            {/* 기존에 서버에 저장된 파일 목록 (Update일 때) */}
            {issueFiles && issueFiles.length > 0 && (
              <Box sx={{ mt: 2 }}>
                <Typography
                  sx={{ fontSize: "0.875rem", fontWeight: 600, mb: 1 }}
                >
                  기존 파일
                </Typography>
                <Box
                  sx={{
                    maxHeight: 300,
                    overflowY: "auto",
                    pr: 1,
                    "&::-webkit-scrollbar": {
                      width: 6,
                    },
                    "&::-webkit-scrollbar-thumb": {
                      backgroundColor: "#ccc",
                      borderRadius: 3,
                    },
                  }}
                >
                  {issueFiles.map((file) => {
                    const { label, color } = getFileInfo(file.originalName);

                    return (
                      <Box
                        key={file.fileId}
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          p: 1.5,
                          bgcolor: "#fafafa",
                          borderRadius: 1.5,
                          mb: 1,
                        }}
                      >
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1.5,
                          }}
                        >
                          {/* 확장자 라벨 */}
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

                          <Box>
                            <Typography
                              sx={{ fontSize: "0.875rem", fontWeight: 500 }}
                            >
                              {file.originalName}
                            </Typography>
                            <Typography
                              sx={{
                                fontSize: "0.75rem",
                                color: "text.secondary",
                              }}
                            >
                              {file.size}
                            </Typography>
                          </Box>
                        </Box>

                        <IconButton
                          size="small"
                          onClick={() =>
                            onRemoveExistingFile
                              ? onRemoveExistingFile(file.fileId)
                              : null
                          }
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    );
                  })}
                </Box>
              </Box>
            )}

            {formData.file && formData.file.length > 0 && (
              <Box sx={{ mt: 2 }}>
                {mode === "update" && (
                  <Typography
                    sx={{ fontSize: "0.875rem", fontWeight: 600, mb: 1 }}
                  >
                    새로 추가된 파일
                  </Typography>
                )}
                <Box
                  ref={listRef}
                  sx={{
                    maxHeight: 300,
                    overflowY: "auto",
                    pr: 1,
                    "&::-webkit-scrollbar": {
                      width: 6,
                    },
                    "&::-webkit-scrollbar-thumb": {
                      backgroundColor: "#ccc",
                      borderRadius: 3,
                    },
                  }}
                >
                  {formData.file.map((file, idx) => {
                    const { label, color } = getFileInfo(file.name);

                    return (
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
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1.5,
                          }}
                        >
                          {/* 확장자 라벨 */}
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

                          <Box>
                            <Typography
                              sx={{ fontSize: "0.875rem", fontWeight: 500 }}
                            >
                              {file.name}
                            </Typography>
                            <Typography
                              sx={{
                                fontSize: "0.75rem",
                                color: "text.secondary",
                              }}
                            >
                              {formatFileSize(file.size)}
                            </Typography>
                          </Box>
                        </Box>

                        <IconButton
                          size="small"
                          onClick={() => onFileRemove(idx)}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    );
                  })}
                </Box>
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
          }}
        >
          <Box
            sx={{
              height: 800,
              display: "flex",
              flexDirection: "column",
              gap: 2,
              bgcolor: "white",
              borderRadius: 2,
              boxShadow: 1,
              minWidth: 150,
              maxWidth: 360,
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
                size="small"
                value={formData.status}
                onChange={(e) => onChangeFormData("status", e.target.value)}
                sx={{
                  width: "100%",
                  "& .MuiOutlinedInput-root": { borderRadius: 1.5 },
                }}
              >
                <MenuItem value="IN_PROGRESS">진행중</MenuItem>
                <MenuItem value="COMPLETED">진행완료</MenuItem>
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
                size="small"
                value={formData.host}
                onChange={(e) => onChangeFormData("host", e.target.value)}
                sx={{
                  width: "100%",
                  "& .MuiOutlinedInput-root": { borderRadius: 1.5 },
                }}
              />
            </Box>

            {/* 시작일/마감일 + 달력 */}
            <Box sx={{ borderRadius: 2, p: 2 }}>
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
                    size="small"
                    placeholder="0000-00-00"
                    value={formData.startDate}
                    onChange={(e) =>
                      onChangeFormData("startDate", e.target.value)
                    }
                    sx={{
                      width: "100%",
                      "& .MuiOutlinedInput-root": { borderRadius: 1.5 },
                    }}
                  />
                </Box>
                <Box>
                  <Typography
                    sx={{ fontWeight: 600, fontSize: "0.875rem", mb: 1.5 }}
                  >
                    마감일
                  </Typography>
                  <TextField
                    size="small"
                    placeholder="0000-00-00"
                    value={formData.endDate ?? ""}
                    onChange={(e) =>
                      onChangeFormData("endDate", e.target.value)
                    }
                    sx={{
                      width: "100%",
                      "& .MuiOutlinedInput-root": { borderRadius: 1.5 },
                    }}
                  />
                </Box>
              </Box>

              <Box sx={{ mt: 2, width: 260 }}>
                <DateRange
                  ranges={range}
                  onChange={(ranges) => {
                    const sel = ranges.selection;

                    if (!sel.startDate || !sel.endDate) return;

                    onSelectRange({
                      startDate: sel.startDate,
                      endDate: sel.endDate,
                      key: sel.key ?? "selection",
                    });
                  }}
                  showMonthAndYearPickers={false}
                  showDateDisplay={false}
                  direction="horizontal"
                />
              </Box>
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
              <FormControl size="small" sx={{ width: "100%" }}>
                <Select
                  value={formData.category}
                  onChange={(e) => onChangeFormData("category", e.target.value)}
                  displayEmpty
                  sx={{ width: "100%", borderRadius: 1.5 }}
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
              <FormControl size="small" sx={{ width: "100%" }}>
                <Select
                  multiple
                  value={formData.department}
                  onChange={(e) =>
                    onDepartmentChange(e.target.value as string[])
                  }
                  sx={{ width: "100%", borderRadius: 1.5 }}
                >
                  {departments.map((dep) => (
                    <MenuItem key={dep.id} value={String(dep.id)}>
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
          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-end",
              width: "100%",
              gap: 1,
            }}
          >
            <Button
              variant="outlined"
              onClick={() => navigate(-1)}
              sx={{
                mt: 3,
                width: 100,
                fontWeight: 600,
                borderRadius: 1.5,
                "&:hover": { boxShadow: 3 },
              }}
            >
              취소
            </Button>
            <Button
              variant="contained"
              onClick={onSubmit}
              disabled={isSaving}
              sx={{
                mt: 3,
                width: 100,
                fontWeight: 600,
                borderRadius: 1.5,
                "&:hover": { boxShadow: 3 },
              }}
            >
              {mode === "create"
                ? isSaving
                  ? "등록 중..."
                  : "등록"
                : isSaving
                ? "수정 중..."
                : "수정"}
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
