import {
  Box,
  Button,
  TextField,
  Typography,
  Select,
  MenuItem,
  FormControl,
  IconButton,
  FormControlLabel,
  Checkbox,
  Tooltip,
} from "@mui/material";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import DeleteIcon from "@mui/icons-material/Delete";
import PartMember from "../../issue/page/PartMember";
import type { MasterDataType } from "../../admin/setting/type/SettingType";
import { StaticDateTimePicker } from "@mui/x-date-pickers";
import dayjs, { Dayjs } from "dayjs";
import type { MeetingFormValues, MeetingMemberDto } from "../type/type";
import type { FileDto, IssueIdTitle } from "../../issue/type/type";
import React, { useEffect, useRef, useState } from "react";
import { formatFileSize, getFileInfo } from "../../common/commonFunction";
import { useNavigate } from "react-router-dom";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { Editor } from "@toast-ui/react-editor";
import httpClient from "../../config/httpClient";
import type { ImageUploadRes } from "../../issue/page/IssueForm";
import "@toast-ui/editor/dist/toastui-editor.css";

interface MeetingFormProps {
  formData: MeetingFormValues;
  issues: IssueIdTitle[];
  categories: MasterDataType[];
  departments: MasterDataType[];
  isSaving: boolean;
  maxFileSize: number | null;
  allowedExtensions: string[] | null;
  meetingFiles?: FileDto[];
  initialMembers?: MeetingMemberDto[];
  onChangeFormData: <K extends keyof MeetingFormValues>(
    key: K,
    value: MeetingFormValues[K]
  ) => void;
  onIssueSelect: (selectedId: string) => void;
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onFileRemove: (idx: number) => void;
  onRemoveExistingFile?: (fileId: number) => void;
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
  meetingFiles,
  onIssueSelect,
  onChangeFormData,
  onFileUpload,
  onFileRemove,
  onOpenFileInput,
  onRemoveExistingFile,
  onDepartmentChange,
  onChangeMembers,
  onSelectDateTime,
  onSubmit,
  mode,
}: MeetingFormProps) {
  const navigate = useNavigate();

  // 파일 개수 변화를 감지해 새로 추가된 파일만 강조하고, 파일 목록은 항상 최신 항목이 보이도록 자동 스크롤 처리
  const listRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<Editor>(null);
  const fileLength = formData.file?.length ?? 0;
  const prevLengthRef = useRef<number>(fileLength);

  useEffect(() => {
    if (!listRef.current) return;
    listRef.current.scrollTop = listRef.current.scrollHeight;
    prevLengthRef.current = fileLength;
  }, [fileLength]);

  // ===================================  시간  =========================================
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

  const handleEditorChange = () => {
    const editorInstance = editorRef.current?.getInstance();
    const content = editorInstance?.getMarkdown() || ""; // 마크다운 형식으로 내용 가져오기
    onChangeFormData("content", content); // 상태 업데이트
  };

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          gap: { md: 3 },
          p: { md: 3 },
          bgcolor: { xs: "white", md: "#f5f5f5" },
          minWidth: { xs: "100%", md: 300 },
          flexDirection: { xs: "column", md: "row" },
        }}
      >
        {/* 왼쪽 섹션 */}
        <Box
          sx={{
            flex: 1,
            bgcolor: "white",
            borderRadius: { md: 2 },
            p: { md: 3 },
            boxShadow: { md: 1 },
            // minWidth: 150,
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
            {/* <TextField
              multiline
              rows={10}
              placeholder="내용을 입력해주세요"
              value={formData.content}
              onChange={(e) => onChangeFormData("content", e.target.value)}
              sx={{
                width: "100%",
                "& .MuiOutlinedInput-root": { borderRadius: 1.5 },
              }}
            /> */}
            <Editor
              ref={editorRef}
              initialValue=""
              previewStyle="vertical"
              height="400px"
              initialEditType="wysiwyg"
              useCommandShortcut={true}
              onChange={handleEditorChange}
              hooks={{
                addImageBlobHook: async (blob: string | Blob, callback: (arg0: string, arg1: string) => void) => {
                  // 이미지를 서버에 업로드
                  const formData = new FormData();
                  formData.append("image", blob);
                  try {
                    const response = await httpClient.post<ImageUploadRes>(
                      "/upload-image", 
                      formData,
                     {
                      headers: {
                        "Content-Type": "multipart/form-data"  // 절대 이렇게 하지 마세요!
                      }
                    });
                    // 업로드된 이미지의 URL을 에디터에 삽입
                    callback(`/api${response.data.imageUrl}`, "alt text");
                  } catch (error) {
                    console.error("이미지 업로드 실패:", error);
                  }
                },
              }}
              toolbarItems={[
                ["heading", "bold", "italic", "strike"],
                ["hr", "quote"],
                ["ul", "ol", "task", "indent", "outdent"],
                ["table", "image", "code", "codeblock"],
                [
                  {
                    name: "undo",
                    tooltip: "되돌리기",
                    el: (() => {
                      const button = document.createElement("button");
                      button.innerHTML = "<i class='fas fa-undo'></i>";
                      // eslint-disable-next-line react-hooks/refs
                      button.addEventListener("click", () => {
                        editorRef.current?.getInstance().exec("undo");
                      });
                      return button;
                    })(),
                  },
                  {
                    name: "redo",
                    tooltip: "다시하기",
                    el: (() => {
                      const button = document.createElement("button");
                      button.innerHTML = "<i class='fas fa-redo'></i>";
                      // eslint-disable-next-line react-hooks/refs
                      button.addEventListener("click", () => {
                        editorRef.current?.getInstance().exec("redo");
                      });
                      return button;
                    })(),
                  },
                ],
              ]}
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
                최대 파일 크기: {maxFileSize}MB <br />
                허용 확장자: {allowedExtensions?.join(", ")}
              </Typography>
            </Box>

            {meetingFiles && meetingFiles.length > 0 && (
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
                  {meetingFiles.map((file) => {
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
                              flexShrink: 0,
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
                              flexShrink: 0,
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
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 2,
              bgcolor: "white",
              borderRadius: { md: 2 },
              boxShadow: { md: 1 },
              p: { xs: 2, md: 3 },
              mt: { xs: 5, md: 0 },
              width: "100%",
              minWidth: { xs: 0, md: 250 },
              maxWidth: 400,
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
                size="small"
                value={formData.host}
                onChange={(e) => onChangeFormData("host", e.target.value)}
                sx={{
                  width: "100%",
                  "& .MuiOutlinedInput-root": { borderRadius: 1.5 },
                }}
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
              <FormControl size="small" sx={{ width: "100%" }}>
                {" "}
                <Select
                  value={formData.issue ?? ""}
                  displayEmpty
                  onChange={(e) => {
                    onIssueSelect(e.target.value);
                  }}
                  sx={{
                    width: "100%",
                    "& .MuiOutlinedInput-root": { borderRadius: 1.5 },
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
            <Box sx={{ borderRadius: 2, p: 2, pb: 0 }}>
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
                    value={selectedDay}
                    onChange={(e) => {
                      const day = e.target.value;
                      setSelectedDay(day);
                      updateStartDate(day, selectedTime); //시간이랑 합쳐서 formData에 반영
                    }}
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
                    시작시간
                  </Typography>
                  <TextField
                    size="small"
                    placeholder="00:00"
                    value={selectedTime}
                    onChange={(e) => {
                      const time = e.target.value;
                      setSelectedTime(time);

                      updateStartDate(selectedDay, time);
                    }}
                    sx={{
                      width: "100%",
                      "& .MuiOutlinedInput-root": { borderRadius: 1.5 },
                    }}
                  />
                </Box>
              </Box>
              <Box sx={{ mt: 2, width: 260 }}>
                {/* 달력 (항상 표시) */}
                <StaticDateTimePicker
                  ampm={false}
                  value={dayjs(`${selectedDay} ${selectedTime}`)}
                  onChange={handleDateTimeChange}
                  slots={{ toolbar: () => null }}
                  slotProps={{ actionBar: { actions: [] } }}
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
                {" "}
                <Select
                  value={formData.categoryId}
                  onChange={(e) =>
                    onChangeFormData("categoryId", e.target.value)
                  }
                  displayEmpty
                  sx={{
                    width: "100%",
                    "& .MuiOutlinedInput-root": { borderRadius: 1.5 },
                  }}
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
                {" "}
                <Select
                  multiple
                  value={formData.departmentIds}
                  onChange={(e) =>
                    onDepartmentChange(e.target.value as string[])
                  }
                  sx={{
                    width: "100%",
                    "& .MuiOutlinedInput-root": { borderRadius: 1.5 },
                  }}
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
            
            {/* 비고 - 새로 추가 */}
            <Box
              sx={{
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                gap: 2,
                borderRadius: 2,
                px: 2,
              }}
            >
              <Typography
                sx={{ 
                  fontWeight: 600, 
                  fontSize: "0.875rem", 
                  width: "80px",
                  mt: 1,
                }}
              >
                비고
              </Typography>
              <TextField
                size="small"
                multiline
                rows={3}
                maxRows={5}
                placeholder="비고 사항을 입력하세요"
                value={formData.remarks ?? ""}
                onChange={(e) => onChangeFormData("remarks", e.target.value)}
                sx={{
                  width: "100%",
                  "& .MuiOutlinedInput-root": { 
                    borderRadius: 1.5,
                    alignItems: "flex-start",
                  },
                }}
              />
            </Box>
            <FormControlLabel
              control={
                <Checkbox
                  checked={formData.isPrivate || false}
                  onChange={(e) =>
                    onChangeFormData("isPrivate", e.target.checked)
                  }
                  color="primary"
                />
              }
              label={
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <span style={{ fontSize: "0.95rem" }}>비밀글 설정</span>

                  {/* 마우스 오버 시 설명을 보여줄 툴팁과 아이콘 */}
                  <Tooltip
                    title="참여자만 볼 수 있습니다"
                    arrow
                    placement="top"
                  >
                    <InfoOutlinedIcon
                      sx={{
                        ml: 0.5,
                        fontSize: "1rem",
                        color: "gray",
                      }}
                    />
                  </Tooltip>
                </Box>
              }
              sx={{ mt: 2 }}
            />
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
