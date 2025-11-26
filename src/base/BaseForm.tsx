import { Box, Button, Typography } from "@mui/material";
import { useState } from "react";
import type { BaseFormValues } from "../type";
import FormField from "./components/FormField";
import SelectField from "./components/SelectField";
import "./baseForm.css";

//BaseForm 컴포넌트가 받아야 하는 props의 타입을 정의
//BaseForm을 사용할 때 반드시 초기값(initialValues)이라는 props를 넘겨야 하고, 그 값은 BaseFormValues 형태여야 한다
//<BaseForm initialValues={...} />으로 사용됨
export interface BaseFormProps<T extends BaseFormValues> {
  //BaseForm이 어떤 타입(T)을 사용할지 제네릭으로 받는다
  initialValues: T;
  //api호출시 사용됨
  onSubmit: (formData: FormData) => void;
}

export default function BaseForm<T extends BaseFormValues>({
  initialValues,
  onSubmit,
}: BaseFormProps<T>) {
  // const [formData, setFormData] = useState<BaseFormValues>({
  //   title: "",
  //   content: "",
  //   file: [],
  //   status: "진행전",
  //   host: "",
  //   startDate: "",
  //   category: "일반업무",
  //   department: [],
  //   member: [],
  //   onSubmit: undefined,
  // });

  // const [formData, setFormData] = useState<BaseFormValues>(initialValues);

  const [formData, setFormData] = useState<BaseFormValues>({
    ...initialValues,
    // formData 객체에 file 속성이 항상 존재함을 보장
    file: initialValues.file ?? [],
  });

  const handleSubmit = async () => {
    const formDataObj = new FormData();

    // 1. DTO에 해당하는 데이터 객체 생성
    // 백엔드의 IssueDto에 매핑되어야 할 모든 필드(파일 제외)
    const issueDto = {
      title: formData.title, //속성(키): 넣을 값
      content: formData.content,
      status: formData.status,
      host: formData.host,
      startDate: formData.startDate,
      endDate: formData.endDate ?? "",
      category: formData.category ?? "",
      // department와 member의 배열 필드는 JSON 문자열 내의 배열로 포함됨.
      department: formData.department,
      member: formData.member,
    };

    // 2. issueDto를 JSON 문자열로 변환하여 "data" 파트에 추가
    // 백엔드의 @RequestPart("data")와 매칭됩니다.
    formDataObj.append("data", JSON.stringify(issueDto));

    console.log("전체", formDataObj);
    console.log("제목: ", formData.title);
    console.log("부서: ", formData.department);
    console.log("참여자: ", formData.member);

    // 3. 파일 배열을 forEach로 순회하며 "file" 파트에 추가
    // 백엔드의 @RequestPart(value = "file")과 매칭
    formData.file?.forEach((file) => formDataObj.append("file", file));

    //부모(<IssueRegister>)가 내려준 함수를 호출하고, BaseForm에서 만든 데이터를 전달함
    onSubmit(formDataObj);

    // formDataObj.append("title", formData.title);
    // formDataObj.append("content", formData.content);
    // formDataObj.append("status", formData.status);
    // formDataObj.append("host", formData.host);
    // formDataObj.append("startDate", formData.startDate);
    // formDataObj.append("endDate", formData.endDate ?? ""); //undefined으로 인한 오류 방지
    // formDataObj.append("category", formData.category ?? ""); //undefined으로 인한 오류 방지
    // //forEach로 배열 안의 파일을 하나씩 꺼내서 FormData에 추가
    // formData.department?.forEach((department) =>
    //   formDataObj.append("department", department)
    // );
    // formData.member?.forEach((member) => formDataObj.append("member", member));
    // formData.file?.forEach((file) => formDataObj.append("file", file));

    // //부모(<IssueRegister>)가 내려준 함수를 호출하고, BaseForm에서 만든 데이터를 전달함
    // onSubmit(formDataObj);
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
    setFormData((prev) => ({ ...prev, department: selected }));
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
          value={formData.status}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              status: e.target.value as string,
            }))
          }
          required
          horizontal
          options={[
            { value: "진행전", label: "진행전" },
            { value: "진행중", label: "진행중" },
            { value: "진행 완료", label: "진행 완료" },
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
          value={formData.category ?? ""} //없으면 빈문자열
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              category: e.target.value as string,
            }))
          }
          required
          horizontal
          options={[
            { value: "일반업무", label: "일반업무" },
            { value: "영업/고객", label: "영업/고객" },
            { value: "연구 개발", label: "연구 개발" },
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
            { value: "기획", label: "기획" },
            { value: "디자인", label: "디자인" },
            { value: "개발", label: "개발" },
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
            onClick={() => handleAddMember("홍길동")} // 예시로 "홍길동" 추가
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
