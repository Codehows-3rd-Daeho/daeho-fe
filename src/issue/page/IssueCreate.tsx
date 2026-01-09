import { issueCreate } from "../api/issueApi";
import { useEffect, useState } from "react";
import { type IssueFormValues, type IssueMemberDto } from "../type/type";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import dayjs from "dayjs";
import { useAuthStore } from "../../store/useAuthStore";
import { useNavigate } from "react-router-dom";
import IssueForm from "./IssueForm";
import type { MasterDataType } from "../../admin/setting/type/SettingType";
import {
  getCategory,
  getDepartment,
} from "../../admin/setting/api/MasterDataApi";
import {
  getExtensions,
  getFileSize,
} from "../../admin/setting/api/FileSettingApi";
import { Box, CircularProgress } from "@mui/material";
import type { ApiError } from "../../config/httpClient";

export interface DateRangeType {
  startDate: Date;
  endDate: Date;
  key: string; //각 범위를 구분하기 위함
}

export default function IssueCreate() {
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
    isPrivate: false,
  });

  // 카테고리와 부서 상태
  const [categories, setCategories] = useState<MasterDataType[]>([]);
  const [departments, setDepartments] = useState<MasterDataType[]>([]);
  // 로그인된 사용자 id
  const { member } = useAuthStore();
  const memberId = member?.memberId;
  const name = member?.name;
  const jobPosition = member?.jobPosition;
  const navigator = useNavigate();

  //파일 설정 값을 자식 컴포넌트로 넘겨주기 위함
  const [maxFileSize, setMaxFileSize] = useState<number | null>(null);
  const [allowedExtensions, setAllowedExtensions] = useState<string[] | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        //===============부서, 주관자 조회===================
        const dep = await getDepartment();
        const cat = await getCategory();

        setDepartments(dep); // 부서 데이터 저장
        setCategories(cat); // 카테고리 데이터 저장

        //===============파일 설정값 조회===================
        const sizeConfig = await getFileSize();
        const extensionConfig = await getExtensions();

        const maxFileSizeByte = Number(sizeConfig.name); // number만 추출
        const maxFileSize = maxFileSizeByte / 1024 / 1024; //바이트 단위 → MB로 변환
        const allowedExtensions = extensionConfig.map((e) =>
          e.name.toLowerCase()
        );

        setMaxFileSize(maxFileSize);
        setAllowedExtensions(allowedExtensions);

        //==================주관자 자동 입력==================
        if (memberId) {
          const hostString = `${name} ${jobPosition}`;

          setFormData((prev) => ({
            ...prev,
            host: hostString,
          }));
        } else {
          console.log("memberId 없음:", memberId);
        }
      } catch (error) {
        const apiError = error as ApiError;
        const response = apiError.response?.data?.message;

        alert(response ?? "데이터를 불러오는 중 오류가 발생했습니다.");
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  // ===============================================================================================
  //                            저장
  // ===============================================================================================

  //저장 상태
  const [isSaving, setIsSaving] = useState(false);

  const isValidDateFormat = (date: string) =>
    dayjs(date, "YYYY-MM-DD", true).isValid();

  const handleSubmit = async () => {
    //=================필수 입력값 체크=====================
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
    // ================= 날짜 형식 검증 =================
    if (
      !isValidDateFormat(formData.startDate) ||
      !isValidDateFormat(formData.endDate)
    ) {
      alert("날짜 형식은 YYYY-MM-DD 형식으로 입력해주세요.");
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

    //=======================FormData===================
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
      isPrivate: formData.isPrivate,
    };

    // 2. issueDto를 JSON 문자열로 변환하여 "data" 파트에 추가
    // 백엔드의 @RequestPart("data")와 매칭
    formDataObj.append(
      "data",
      new Blob([JSON.stringify(issueDto)], { type: "application/json" })
    );

    // 3. 파일 배열을 forEach로 순회하며 "file" 파트에 추가
    // 백엔드의 @RequestPart(value = "file")과 매칭
    formData.file?.forEach((file) => formDataObj.append("file", file));

    //===================전송=========================
    try {
      setIsSaving(true); // 저장 시작 (중복 클릭 방지)

      await issueCreate(formDataObj);

      alert("이슈가 등록되었습니다!");
      navigator(`/issue/list`);
    } catch (error) {
      const apiError = error as ApiError;
      const response = apiError.response?.data?.message;

      alert(response ?? "이슈 등록 중 오류가 발생했습니다.");
      console.error("이슈 등록 실패:", error);
    } finally {
      setIsSaving(false); // 버튼 원상복귀
    }
  };

  // ===============================================================================================
  //                            파일
  // ===============================================================================================

  // 파일 입력창 열기
  const openFileInput = () => {
    document.getElementById("fileUpload")?.click();
  };

  // 파일 업로드 핸들러
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    //HTML input[type="file"]의 파일 목록 속성 이름은 files
    const uploadedFiles = Array.from(e.target.files || []);

    if (!maxFileSize || !allowedExtensions) {
      alert("파일 설정값을 불러오는 중입니다. 잠시 후 다시 시도해주세요.");
      return;
    }

    //업로드 가능한 확장자, 용량의 파일을 담을 배열
    const validFiles: File[] = [];

    //업로드된 파일 배열을 돌면서 체크
    uploadedFiles.forEach((file) => {
      //확장자 추출
      const ext = file.name.split(".").pop()?.toLowerCase();

      // 1) 확장자 체크
      const isAllowed = ext != null && allowedExtensions.includes(ext);

      if (!isAllowed) {
        alert(`허용되지 않은 확장자입니다: ${file.name}`);
        return;
      }

      // 2) 용량 체크
      const sizeMB = file.size / 1024 / 1024; //바이트 단위 → MB로 변환

      if (sizeMB > maxFileSize) {
        alert(
          `${
            file.name
          } 파일의 크기가 ${maxFileSize}MB를 초과했습니다.\n(현재: ${sizeMB.toFixed(
            2
          )}MB)`
        );
        return; // 이 파일만 제외
      }

      //확장자, 용량 체크 성공한 file만 배열에 추가
      validFiles.push(file);
    });

    // 검증된 파일만 반영
    if (validFiles.length > 0) {
      setFormData((prev) => ({
        ...prev,
        // file?: File[] === file: File[] | undefined이기 때문에 undefined으로 인한 오류 방지
        file: [...(prev.file ?? []), ...validFiles],
      }));
    }
  };

  // ===============================================================================================
  //                        부서
  // ===============================================================================================

  // 관련 부서 다중 선택
  const handleDepartmentChange = (selected: string[]) => {
    setFormData((prev) => ({
      ...prev,
      department: selected, // <-- 숫자 변환 절대 하지 않기
    }));
  };
  // ===============================================================================================
  //                        시작일, 마감일
  // ===============================================================================================

  // range : 현재 달력에서 선택된 날짜 범위를 담는 상태
  const [range, setRange] = useState([
    {
      startDate: new Date(), //오늘 날짜
      endDate: new Date(),
      key: "selection", //react-date-range에서 범위를 구분
    },
  ]);

  //DatePicker와 TextField연결
  //DateRangeType 전체 객체에서 selection 객체로 변경
  const handleSelect = (selection: DateRangeType) => {
    setRange([selection]); // 달력 선택 반영
    setFormData((prev) => ({
      ...prev,
      startDate: dayjs(selection.startDate).format("YYYY-MM-DD"),
      endDate: dayjs(selection.endDate).format("YYYY-MM-DD"),
    })); // TextField에 반영
  };

  // ===============================================================================================
  //                          참여자
  // ===============================================================================================

  //partmember객체 받기
  const [issueMembers, setIssueMembers] = useState<IssueMemberDto[]>([]);

  if (isLoading) {
    return (
      <Box
        sx={{
          height: "80vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <>
      <IssueForm
        mode="create"
        formData={formData}
        categories={categories}
        departments={departments}
        range={range}
        isSaving={isSaving} //저장 상태(중복 방지)
        maxFileSize={maxFileSize} //허용 파일 사이즈 표시
        allowedExtensions={allowedExtensions} //허용 확장자 표시
        onChangeFormData={(key, value) =>
          setFormData((prev) => ({ ...prev, [key]: value }))
        } //자식 컴포넌트에서 onChangeFormData("key", "value");로 자동 set가능
        onFileUpload={handleFileUpload}
        onFileRemove={(idx) =>
          setFormData((prev) => ({
            ...prev,
            file: prev.file?.filter((_, i) => i !== idx),
          }))
        }
        onOpenFileInput={openFileInput}
        onDepartmentChange={handleDepartmentChange}
        onChangeMembers={setIssueMembers}
        onSelectRange={handleSelect}
        onSubmit={handleSubmit}
      />
    </>
  );
}
