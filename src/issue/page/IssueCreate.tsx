import { issueCreate } from "../api/issueApi";
import { Box, Button, Typography } from "@mui/material";
import { useState } from "react";
import type { BaseFormValues } from "../type/type";
import FormField from "../base/component/FormField";
import SelectField from "../base/component/SelectField";

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
    <Box sx={{ display: "flex", gap: 2 }}>
      {/* 왼쪽 컬럼 */}
      <Box id="leftBox">
        <FormField
          label="제목"
          name="title"
          value={formData.title}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, title: e.target.value }))
          }
          required
        />
        <FormField
          label="본문"
          name="content"
          value={formData.content}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, content: e.target.value }))
          }
          required
          inputHeight="300px"
        />
        {/* 첨부파일 영역 */}
        <Box>
          <input
            type="file"
            multiple
            id="fileUpload"
            style={{ display: "none" }}
            className="baseform-button file-select-button"
            onChange={handleFileUpload}
          />

          <Button
            className="baseform-button file-select-button"
            variant="contained"
            onClick={openFileInput}
          >
            파일 선택
          </Button>
          {/* 선택한 파일들 표시 및 삭제 버튼*/}
          {formData.file?.map((file, idx) => (
            <Box key={idx}>
              <Typography>{file.name}</Typography>
              <Button
                size="small"
                onClick={() =>
                  setFormData((prev) => ({
                    ...prev,
                    file: prev.file?.filter((_, i) => i !== idx),
                  }))
                }
              >
                삭제
              </Button>
            </Box>
          ))}
        </Box>
      </Box>

      {/* 오른쪽 컬럼 */}
      <Box id="rightBox">
        <SelectField
          label="상태"
          name="status"
          value={formData.status} //여기가 한글이면 안됨
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              status: e.target.value as string,
            }))
          }
          required
          horizontal
          options={[
            { value: "PLANNED", label: "진행전" },
            { value: "IN_PROGRESS", label: "진행중" },
            { value: "COMPLETED", label: "진행 완료" },
          ]}
        />
        <FormField
          label="주관자"
          name="host"
          value={formData.host}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, host: e.target.value }))
          }
          required
          inputWidth="350px"
          horizontal
        />

        {/* 시작일, 마감일 */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "row", // 가로 정렬
            justifyContent: "center", // 수평 중앙 정렬
            alignItems: "center", // 수직 중앙 정렬
            gap: 2, // 요소 간 간격
          }}
        >
          <FormField
            label="시작일"
            name="startDate"
            value={formData.startDate}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, startDate: e.target.value }))
            }
            required
            inputWidth="220px"
          />
          <FormField
            label="마감일"
            name="endDate"
            value={formData.endDate ?? ""} //없으면 빈문자열
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, endDate: e.target.value }))
            }
            required
            inputWidth="220px"
          />
        </Box>
        <SelectField
          label="카테고리"
          name="category"
          value={formData.category}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              category: e.target.value as string,
            }))
          }
          required
          horizontal
          options={[
            { value: "1", label: "일반업무" },
            { value: "2", label: "영업/고객" },
            { value: "3", label: "연구 개발" },
          ]}
        />

        <SelectField
          label="관련 부서"
          name="department"
          value={formData.department}
          onChange={(e) => handleDepartmentChange(e.target.value as string[])}
          required
          horizontal
          multiple
          options={[
            { value: "1", label: "기획" },
            { value: "2", label: "디자인" },
            { value: "3", label: "개발" },
          ]}
        />
        {/* 버튼과 라벨 텍스트를 함께 넣기 */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <Typography sx={{ textAlign: "right" }}>참여자</Typography>
          <Button
            variant="contained"
            className="baseform-button add-member-button"
            onClick={() => handleAddMember("1")} // 예시로 "홍길동" 추가
          >
            참여자 추가
          </Button>
        </Box>
        <Button
          variant="contained"
          className="baseform-button submit-button"
          onClick={handleSubmit}
        >
          등록
        </Button>
      </Box>
    </Box>
  );
}
