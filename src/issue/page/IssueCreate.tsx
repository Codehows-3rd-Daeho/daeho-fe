import { issueCreate } from "../api/issueApi";
import { Box, Button, TextField, Typography } from "@mui/material";
import { useState } from "react";
import type { BaseFormValues } from "../type/type";
import { Select, MenuItem, FormControl, InputAdornment } from "@mui/material";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import DeleteIcon from "@mui/icons-material/Delete";

export default function IssueCreate() {
  const [formData, setFormData] = useState<BaseFormValues>({
    title: "",
    content: "",
    file: [],
    status: "",
    host: "",
    startDate: "",
    endDate: "",
    category: "",
    department: [],
    member: [],
    isDel: "false",
  });

  const handleSubmit = async () => {
    const formDataObj = new FormData();

    // 1. DTO에 해당하는 데이터 객체 생성
    // 백엔드의 IssueDto에 매핑되어야 할 모든 필드(파일 제외)
    const issueDto = {
      title: formData.title, //속성(키): 넣을 값 | 백엔드 Dto 필드명: 프론트 필드명
      content: formData.content,
      status: formData.status,
      host: formData.host,
      startDate: formData.startDate,
      endDate: formData.endDate ?? "",
      //서버로 전송 시 string -> Number 변환
      categoryId: Number(formData.category),
      departmentIds: formData.department.map(Number),
      memberIds: formData.member.map(Number),
      isDel: "false",
    };

    // 2. issueDto를 JSON 문자열로 변환하여 "data" 파트에 추가
    // 백엔드의 @RequestPart("data")와 매칭됩니다.
    // formDataObj.append("data", JSON.stringify(issueDto));
    // Spring에서 DTO로 자동 매핑
    formDataObj.append(
      "data",
      new Blob([JSON.stringify(issueDto)], { type: "application/json" })
    );

    // 3. 파일 배열을 forEach로 순회하며 "file" 파트에 추가
    // 백엔드의 @RequestPart(value = "file")과 매칭
    formData.file?.forEach((file) => formDataObj.append("file", file));

    console.log("====== React State(formData) ======");
    console.log(JSON.stringify(formData, null, 2));
    console.log("전체", formDataObj);
    console.log("제목: ", formData.title);

    console.log("====== DTO 내용(issueDto) ======");
    console.log(JSON.stringify(issueDto, null, 2));
    console.log("카테고리: ", issueDto.categoryId);
    console.log("부서: ", issueDto.departmentIds);
    console.log("참여자: ", issueDto.memberIds);
    console.log("진행상태: ", issueDto.status);
    console.log("삭제상태: ", issueDto.isDel);

    console.log("====== FormData 실제 값 ======");
    // FormData 객체 내부 확인 (중요!!)
    for (const [key, value] of formDataObj.entries()) {
      if (value instanceof Blob) {
        console.log(
          `key: ${key}, value: Blob(size=${value.size}, type=${value.type})`
        );
      } else {
        console.log(`key: ${key}, value:`, value);
      }
    }
    console.log("보내는 데이터", issueDto);
    await issueCreate(formDataObj);
    alert("이슈가 등록되었습니다!");
  };

  // 파일 입력창 열기
  const openFileInput = () => {
    document.getElementById("fileUpload")?.click();
  };

  // 파일 업로드 핸들러
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    //HTML input[type="file"]의 파일 목록 속성 이름은 files
    const newFiles = Array.from(e.target.files || []);

    setFormData((prev) => ({
      ...prev,
      // file?: File[] === file: File[] | undefined이기 때문에 undefined으로 인한 오류 방지
      file: [...(prev.file ?? []), ...newFiles],
    }));
  };

  // 관련 부서 다중 선택
  const handleDepartmentChange = (selected: string[]) => {
    setFormData((prev) => ({
      ...prev,
      department: selected.map(Number), // 문자열 → 숫자
    }));
  };

  // 참여자 추가
  const handleAddMember = (member: string) => {
    setFormData((prev) => ({
      ...prev,
      member: [...(prev.member ?? []), member],
    }));
  };

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          gap: 3,
          p: 3,
          bgcolor: "#f5f5f5",
          minHeight: "100vh",
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
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, title: e.target.value }))
              }
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
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, content: e.target.value }))
              }
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
              onChange={handleFileUpload}
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
              onClick={openFileInput}
            >
              <UploadFileIcon sx={{ fontSize: 48, color: "#9e9e9e", mb: 1 }} />
              <Typography
                sx={{ fontSize: "0.875rem", fontWeight: 500, mb: 0.5 }}
              >
                Choose a file or drag & drop it here.
              </Typography>

              {/* <Button
                variant="outlined"
                size="small"
                onClick={openFileInput}
                sx={{ borderRadius: 1.5 }}
              >
                Browse files
              </Button> */}
            </Box>

            {/* 업로드된 파일 목록 */}
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
                      onClick={() =>
                        setFormData((prev) => ({
                          ...prev,
                          file: prev.file?.filter((_, i) => i !== idx),
                        }))
                      }
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
            flexDirection: "column", // 세로 배치
            alignItems: "center", // 가로 가운데 정렬
            justifyContent: "center", // 세로 가운데 정렬
            height: "100%", // 또는 원하는 높이 값
          }}
        >
          <Box
            sx={{
              height: 400,
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
              }}
            >
              <Typography
                sx={{
                  fontWeight: 600,
                  fontSize: "0.875rem",
                  width: "80px",
                }}
              >
                상태
              </Typography>
              <Select
                fullWidth
                size="small"
                value={formData.status}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, status: e.target.value }))
                }
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
                sx={{
                  fontWeight: 600,
                  fontSize: "0.875rem",
                  width: "80px",
                }}
              >
                주관자
              </Typography>
              <TextField
                fullWidth
                size="small"
                value={formData.host}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, host: e.target.value }))
                }
                placeholder="홍길동 과장"
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: 1.5 } }}
              />
            </Box>
            {/* 시작일/마감일 */}
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
                    fullWidth
                    size="small"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        startDate: e.target.value,
                      }))
                    }
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: 1.5 } }}
                    InputProps={{
                      endAdornment: <InputAdornment position="end" />,
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
                    fullWidth
                    size="small"
                    type="date"
                    value={formData.endDate ?? ""}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        endDate: e.target.value,
                      }))
                    }
                    sx={{ "& .MuiOutlinedInput-root": { borderRadius: 1.5 } }}
                    InputProps={{
                      endAdornment: <InputAdornment position="end" />,
                    }}
                  />
                </Box>
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
                sx={{
                  fontWeight: 600,
                  fontSize: "0.875rem",
                  width: "80px",
                }}
              >
                카테고리
              </Typography>
              <FormControl fullWidth size="small">
                <Select
                  value={formData.category}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      category: e.target.value,
                    }))
                  }
                  displayEmpty
                  sx={{ borderRadius: 1.5 }}
                >
                  <MenuItem value="">영업/고객</MenuItem>
                  <MenuItem value="1">일반업무</MenuItem>
                  <MenuItem value="2">영업/고객</MenuItem>
                  <MenuItem value="3">연구 개발</MenuItem>
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
                sx={{
                  fontWeight: 600,
                  fontSize: "0.875rem",
                  width: "80px",
                }}
              >
                관련 부서
              </Typography>
              <FormControl fullWidth size="small">
                <Select<string[]>
                  multiple
                  value={formData.department.map(String)}
                  onChange={(e) =>
                    handleDepartmentChange(e.target.value as string[])
                  }
                  sx={{ borderRadius: 1.5 }}
                >
                  <MenuItem value="1">기획</MenuItem>
                  <MenuItem value="2">디자인</MenuItem>
                  <MenuItem value="3">개발</MenuItem>
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
                sx={{
                  fontWeight: 600,
                  fontSize: "0.875rem",
                  width: "80px",
                }}
              >
                참여자
              </Typography>
              <Button
                fullWidth
                variant="outlined"
                size="small"
                onClick={() => handleAddMember("1")}
                sx={{
                  justifyContent: "flex-start",
                  color: "text.secondary",
                  borderRadius: 1.5,
                  textTransform: "none",
                }}
              >
                참여자 추가
              </Button>
            </Box>
          </Box>
          {/* 등록 버튼 */}
          <Box sx={{ display: "flex" }}>
            <Box
              sx={{
                width: 250,
              }}
            ></Box>
            <Button
              variant="contained"
              onClick={handleSubmit}
              sx={{
                width: 100,
                p: 2,
                m: 3,
                fontWeight: 600,
                borderRadius: 1.5,
                "&:hover": {
                  boxShadow: 3,
                },
              }}
            >
              등록
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
