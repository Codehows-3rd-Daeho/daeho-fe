import { useEffect, useState } from "react";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import { useAuthStore } from "../../store/useAuthStore";
import { useNavigate, useSearchParams } from "react-router-dom";
import MeetingForm from "./MeetingForm";
import type {
  IssueInMeeting,
  MeetingFormValues,
  MeetingMemberDto,
} from "../type/type";
import { meetingCreate } from "../api/MeetingApi";
import type { MasterDataType } from "../../admin/setting/type/SettingType";
import {
  getCategory,
  getDepartment,
} from "../../admin/setting/api/MasterDataApi";
import {
  getExtensions,
  getFileSize,
} from "../../admin/setting/api/FileSettingApi";
import { getIssueInMeeting, getSelectedINM } from "../../issue/api/issueApi";
import type { IssueIdTitle } from "../../issue/type/type";
import dayjs, { Dayjs } from "dayjs";
import { Box, CircularProgress } from "@mui/material";
import type { ApiError } from "../../config/httpClient";

export default function MeetingCreate() {
  const [formData, setFormData] = useState<MeetingFormValues>({
    title: "",
    content: "",
    file: [],
    status: "PLANNED",
    host: "",
    issue: "",
    startDate: dayjs().format("YYYY-MM-DD HH:mm"), //날짜 + 시간 형식
    endDate: "",
    categoryId: "",
    departmentIds: [],
    members: [],
    isDel: false,
  });

  // issue, 카테고리, 부서 상태
  const [issues, setIssues] = useState<IssueIdTitle[]>([]);
  const [categories, setCategories] = useState<MasterDataType[]>([]);
  const [departments, setDepartments] = useState<MasterDataType[]>([]);

  // 로그인된 회원 정보
  const { member } = useAuthStore();
  const memberId = member?.memberId;
  const name = member?.name;
  const jobPosition = member?.jobPosition;

  //파일 설정 값을 자식 컴포넌트로 넘겨주기 위함
  const [maxFileSize, setMaxFileSize] = useState<number | null>(null);
  const [allowedExtensions, setAllowedExtensions] = useState<string[] | null>(
    null
  );

  //partmember객체 받기(PartMember에서 전달받은 객체)
  const [meetingMembers, setMeetingMembers] = useState<MeetingMemberDto[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const issueId = searchParams.get("issueId");

  const navigator = useNavigate();

  useEffect(() => {
    async function fetchData() {
      try {
        //=================이슈, 카테고리, 부서 목록 조회=================
        const iss = await getIssueInMeeting();
        const cat = await getCategory();
        const dep = await getDepartment();

        setIssues(iss);
        setCategories(cat); // 카테고리 데이터 저장
        setDepartments(dep); // 부서 데이터 저장

        //=======================파일 설정값 조회===================
        const sizeConfig = await getFileSize();
        const extensionConfig = await getExtensions();

        const maxFileSizeByte = Number(sizeConfig.name); // number만 추출
        const maxFileSize = maxFileSizeByte / 1024 / 1024; //바이트 단위 → MB로 변환
        const allowedExtensions = extensionConfig.map((e) =>
          e.name.toLowerCase()
        );

        setMaxFileSize(maxFileSize);
        setAllowedExtensions(allowedExtensions);

        //======================주관자 자동 입력==================
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
        if (apiError.response?.status === 401) return;
        const response = apiError.response?.data?.message;

        alert(response ?? "데이터를 불러오는 중 오류가 발생했습니다.");
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  // 이슈상세에서 회의 등록으로 넘어온 경우
  useEffect(() => {
    if (!issueId) return;

    const fetchIssue = async () => {
      try {
        const issue = await getSelectedINM(Number(issueId));

        setFormData((prev) => ({
          ...prev,
          issue: String(issue.id),
          categoryId: issue.categoryId,
          departmentIds: issue.departmentIds,
          members: issue.members,
        }));

        setMeetingMembers(issue.members);
      } catch (error) {
        const apiError = error as ApiError;
        if (apiError.response?.status === 401) return;
        const response = apiError.response?.data?.message;

        alert(response ?? "오류가 발생했습니다.");
      }
    };

    fetchIssue();
  }, [issueId]);

  // ===============================================================================================
  //                            저장
  // ===============================================================================================

  //저장 상태
  const [isSaving, setIsSaving] = useState(false);
  const normalizeDateTime = (value: string) =>
    dayjs(value).format("YYYY-MM-DD HH:mm");

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
    const normalizedStartDate = normalizeDateTime(formData.startDate);

    if (!dayjs(normalizedStartDate, "YYYY-MM-DD HH:mm", true).isValid()) {
      alert("날짜 형식은 YYYY-MM-DD HH:mm 입니다.");
      return;
    }
    if (!formData.categoryId) {
      alert("카테고리를 선택해주세요.");
      return;
    }
    if (!formData.departmentIds || formData.departmentIds.length === 0) {
      alert("관련 부서를 선택해주세요.");
      return;
    }

    //==========================FormData===========================
    const formDataObj = new FormData();

    // 1. DTO에 해당하는 데이터 객체 생성
    // 백엔드의 meetingDto에 매핑되어야 할 모든 필드(파일 제외)
    const meetingDto = {
      title: formData.title,
      content: formData.content,
      status: formData.status,
      host: formData.host,
      issueId: Number(formData.issue),
      startDate: normalizedStartDate,
      categoryId: Number(formData.categoryId),
      departmentIds: formData.departmentIds.map(Number),
      members: meetingMembers, //PartMember에서 전달받은 객체
      isDel: false,
    };

    // 2. meetingDto를 JSON 문자열로 변환하여 "data" 파트에 추가
    // 백엔드의 @RequestPart("data")와 매칭
    formDataObj.append(
      "data",
      new Blob([JSON.stringify(meetingDto)], { type: "application/json" })
    );

    // 3. 파일 배열을 forEach로 순회하며 "file" 파트에 추가
    // 백엔드의 @RequestPart(value = "file")과 매칭
    formData.file?.forEach((file) => formDataObj.append("file", file));

    //============================전송============================
    try {
      setIsSaving(true); // 저장 시작 (중복 클릭 방지
      await meetingCreate(formDataObj);

      alert("회의가 등록되었습니다!");
      navigator(`/meeting/list`);
    } catch (error) {
      const apiError = error as ApiError;
      if (apiError.response?.status === 401) return;
      const response = apiError.response?.data?.message;

      alert(response ?? "회의 등록 중 오류가 발생했습니다.");
      console.error("회의 등록 실패:", error);
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
      departmentIds: selected,
    }));
  };

  // ===============================================================================================
  //                        시작일, 마감일
  // ===============================================================================================

  const handleSelectDateTime = (value: Dayjs | null) => {
    if (!value) return;

    setFormData((prev) => ({
      ...prev,
      startDate: value.format("YYYY-MM-DD HH:mm"),
    }));
  };

  // ===============================================================================================
  //                          이슈 선택시 카테고리,부서,멤버 자동선택

  const onIssueSelect = async (selectedId: string) => {
    try {
      //string => number
      const idNumber = Number(selectedId);
      // 1. 선택된 이슈 상세 데이터 가져오기
      const issue: IssueInMeeting = await getSelectedINM(idNumber);
      // 2.  formData 동기화
      setFormData((prev) => {
        const updatedFormData = {
          ...prev,
          issue: String(issue.id),
          categoryId: issue.categoryId,
          departmentIds: Array.isArray(issue.departmentIds)
            ? issue.departmentIds.map(String)
            : [],
          members: issue.members, // IssueMemberDto[]
        };
        return updatedFormData;
      });

      // 3️⃣ PartMember UI 업데이트 (선택된 멤버 표시 등)
      setMeetingMembers(issue.members);
      alert("이슈의 카테고리, 부서, 참여자 정보를 불러왔습니다.");
    } catch (error) {
      const apiError = error as ApiError;
      if (apiError.response?.status === 401) return;
      const response = apiError.response?.data?.message;

      alert(response ?? "이슈 정보를 불러오지 못했습니다.");
      console.error("이슈 상세 조회 실패:", error);
    }
  };

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
      <MeetingForm
        formData={formData}
        issues={issues}
        categories={categories}
        departments={departments}
        isSaving={isSaving} //저장 상태(중복 방지)
        maxFileSize={maxFileSize} //허용 파일 사이즈 표시
        allowedExtensions={allowedExtensions} //허용 확장자 표시
        onIssueSelect={onIssueSelect}
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
        onSelectDateTime={handleSelectDateTime}
        onDepartmentChange={handleDepartmentChange}
        onChangeMembers={setMeetingMembers}
        onSubmit={handleSubmit}
        mode="create"
      />
    </>
  );
}
