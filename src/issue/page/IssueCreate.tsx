import { issueCreate } from "../api/issueApi";
import { Box, Button, TextField, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { type IssueFormValues, type IssueMemberDto } from "../type/type";
import { Select, MenuItem, FormControl, InputAdornment } from "@mui/material";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import DeleteIcon from "@mui/icons-material/Delete";
import { DateRange } from "react-date-range";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import dayjs from "dayjs";
import { getCategory, getDepartment } from "../../admin/api/MasterDataApi";
import type { MasterDataType } from "../../admin/type/SettingType";
import { useAuthStore } from "../../store/useAuthStore";
import PartMember from "./PartMember";
import { getHostData } from "../../admin/api/MemberApi";
import { useNavigate } from "react-router-dom";

interface DateRangeType {
  selection: {
    startDate: Date;
    endDate: Date;
    key: string; //각 범위를 구분하기 위함
  };
}

export default function IssueCreate() {
  const navigator = useNavigate();
  const [formData, setFormData] = useState<IssueFormValues>({
    title: "",
    content: "",
    file: [],
    status: "IN_PROGRESS",
    host: "",
    startDate: "",
    endDate: "",
    category: "",
    department: [],
    members: [],
    isDel: false,
  });

  // 카테고리와 부서 상태
  const [categories, setCategories] = useState<MasterDataType[]>([]);
  const [departments, setDepartments] = useState<MasterDataType[]>([]);
  // 로그인된 사용자 id
  const { memberId } = useAuthStore();

  // 부서 직급 가져오기
  useEffect(() => {
    // 모달이 열릴 때 부서와 직급 데이터를 불러옵니다.
    async function fetchData() {
      try {
        const dep = await getDepartment();
        const cat = await getCategory();

        setDepartments(dep); // 부서 데이터 저장
        setCategories(cat); // 카테고리 데이터 저장

        //주관자 = 작성자 자동 입력
        if (memberId) {
          const hostData = await getHostData(memberId);

          console.log("주관자 확인");
          console.log("getHostData: ", hostData);
          const hostString = `${hostData.name} ${hostData.jobPositionName}`;

          console.log("hostString: ", hostString);
          setFormData((prev) => ({
            ...prev,
            host: hostString, // ★ 자동 입력
          }));
          console.log("hostString: ", formData.host);
        } else {
          console.log("memberId 없음:", memberId);
        }
      } catch (error) {
        console.log("데이터를 불러오는 중 오류 발생", error);
      }
    }
    fetchData();
  }, []);

  const handleSubmit = async () => {
    // 필수 입력값 체크
    if (!formData.title.trim()) {
      alert("제목을 입력해주세요.");
      return;
    }
    if (!formData.content.trim()) {
      alert("본문을 입력해주세요.");
      return;
    }
    if (!formData.startDate) {
      alert("시작일을 선택해주세요.");
      return;
    }
    if (!formData.endDate) {
      alert("마감일을 선택해주세요.");
      return;
    }
    if (!formData.category) {
      alert("카테고리를 선택해주세요.");
      return;
    }
    if (!formData.department || formData.department.length === 0) {
      alert("관련 부서를 선택해주세요.");
      return;
    }

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
      members: issueMembers, //PartMember에서 전달받은 객체
      isDel: false,
    };

    // 2. issueDto를 JSON 문자열로 변환하여 "data" 파트에 추가
    // 백엔드의 @RequestPart("data")와 매칭
    // formDataObj.append("data", JSON.stringify(issueDto));
    // Spring에서 DTO로 자동 매핑
    formDataObj.append(
      "data",
      new Blob([JSON.stringify(issueDto)], { type: "application/json" })
    );

    // 3. 파일 배열을 forEach로 순회하며 "file" 파트에 추가
    // 백엔드의 @RequestPart(value = "file")과 매칭
    formData.file?.forEach((file) => formDataObj.append("file", file));

    console.log("보내는 데이터", issueDto);
    await issueCreate(formDataObj);
    alert("이슈가 등록되었습니다!");
    navigator("/issue/list");
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

  // range : 현재 달력에서 선택된 날짜 범위를 담는 상태
  const [range, setRange] = useState([
    {
      startDate: new Date(), //오늘 날짜
      endDate: new Date(),
      key: "selection", //react-date-range에서 범위를 구분
    },
  ]);

  //DatePicker와 TextField연결
  const handleSelect = (ranges: DateRangeType) => {
    const { startDate, endDate } = ranges.selection;

    setRange([ranges.selection]); // 달력 선택 반영

    setFormData((prev) => ({
      ...prev,
      startDate: dayjs(startDate).format("YYYY-MM-DD"),
      endDate: dayjs(endDate).format("YYYY-MM-DD"),
    })); // TextField에 반영
  };
  //partmember객체 받기
  const [issueMembers, setIssueMembers] = useState<IssueMemberDto[]>([]);

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
          {/* 흰색 박스 영역 */}
          <Box
            sx={{
              height: 1000,
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
                disabled
                fullWidth
                size="small"
                value={formData.host}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, host: e.target.value }))
                }
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: 1.5 } }}
              />
            </Box>
            {/* 시작일/마감일 */}
            <Box sx={{ borderRadius: 2, p: 2 }}>
              {/* 캘린더 영역 */}
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 2,
                }}
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

              {/* react-date-range 달력*/}
              <Box sx={{ mt: 2 }}>
                <DateRange
                  ranges={range}
                  onChange={handleSelect}
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
                  {/* categories.map : 배열을 돌면서 <MenuItem> 컴포넌트 생성
                  key: React 내부에서 사용하는 키
                  value: 선택 값, formData에 저장
                  {cat.name}: 화면에 표시되는 텍스트 */}
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
                sx={{
                  fontWeight: 600,
                  fontSize: "0.875rem",
                  width: "80px",
                }}
              >
                참여자
              </Typography>
              <PartMember onChangeMembers={setIssueMembers} />
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
