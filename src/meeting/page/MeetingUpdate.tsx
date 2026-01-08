import { useEffect, useState } from "react";
import type {
  IssueInMeeting,
  MeetingFormValues,
  MeetingMemberDto,
} from "../type/type";
import dayjs, { Dayjs } from "dayjs";
import type { FileDto, IssueIdTitle } from "../../issue/type/type";
import type { MasterDataType } from "../../admin/setting/type/SettingType";
import { useNavigate, useParams } from "react-router-dom";
import MeetingForm from "./MeetingForm";
import {
  getExtensions,
  getFileSize,
} from "../../admin/setting/api/FileSettingApi";
import {
  getCategory,
  getDepartment,
} from "../../admin/setting/api/MasterDataApi";
import { getIssueInMeeting, getSelectedINM } from "../../issue/api/issueApi";
import { getMeetingDtl, updateMeeting } from "../api/MeetingApi";
import { Box, CircularProgress } from "@mui/material";
import type { ApiError } from "../../config/httpClient";

export default function MeetingUpdate() {
  const { meetingId } = useParams<{ meetingId: string }>();
  const [formData, setFormData] = useState<MeetingFormValues>({
    title: "",
    content: "",
    file: [],
    status: "PLANNED",
    host: "",
    issue: "",
    startDate: dayjs().format("YYYY-MM-DD HH:mm"),
    endDate: "",
    categoryId: "",
    departmentIds: [],
    members: [],
    isDel: false,
  });

  const [issues, setIssues] = useState<IssueIdTitle[]>([]);
  const [categories, setCategories] = useState<MasterDataType[]>([]);
  const [departments, setDepartments] = useState<MasterDataType[]>([]);
  const [meetingMembers, setMeetingMembers] = useState<MeetingMemberDto[]>([]);
  const [meetingFiles, setMeetingFiles] = useState<FileDto[]>([]); // 기존에 등록된 파일 목록
  const [removedFileIds, setRemovedFileIds] = useState<number[]>([]); // 삭제할 기존 파일 id
  const [maxFileSize, setMaxFileSize] = useState<number>(0);
  const [allowedExtensions, setAllowedExtensions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    if (!meetingId) {
      navigate("/meeting/list");
      return;
    }

    async function fetchData() {
      try {
        const meeting = await getMeetingDtl(meetingId as string);
        const iss = await getIssueInMeeting();
        const cat = await getCategory();
        const dep = await getDepartment();

        setIssues(iss);
        setCategories(cat);
        setDepartments(dep);

        const selectedCategory = cat.find(
          (c) => c.name === meeting.categoryName
        );
        const categoryId = selectedCategory ? String(selectedCategory.id) : "";

        const departmentIds: string[] = meeting.departmentName
          .map((name) => {
            const dept = dep.find((d) => d.name === name);
            return dept ? String(dept.id) : undefined;
          })
          .filter((id): id is string => Boolean(id));

        let formattedStartDate = meeting.startDate;
        if (meeting.startDate) {
          // 서버에서 받은 형식(예: YYYY.MM.DD HH:mm)을 (YYYY-MM-DD HH:mm)으로 다시 포맷
          formattedStartDate = dayjs(meeting.startDate).format(
            "YYYY-MM-DD HH:mm"
          );
        }

        setFormData({
          title: meeting.title,
          content: meeting.content,
          file: [],
          status: meeting.status,
          host: `${meeting.hostName ?? ""} ${meeting.hostJPName ?? ""}`,
          startDate: formattedStartDate,
          categoryId: categoryId,
          departmentIds: departmentIds,
          issue: String(meeting.issueId),
          members: meeting.participantList,
          isDel: false,
        });

        setMeetingFiles(meeting.fileList || []);
        setRemovedFileIds([]);

        setMeetingMembers(meeting.participantList);
      } catch (error) {
        const apiError = error as ApiError;
        if (apiError.response?.status === 401) return;
        const response = apiError.response?.data?.message;

        alert(response ?? "회의 데이터 로딩 중 오류가 발생했습니다.");

        navigate(`/meeting/${meetingId}`);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, [meetingId, navigate]);

  useEffect(() => {
    async function fetchFileConfig() {
      try {
        const sizeConfig = await getFileSize();
        const extensionConfig = await getExtensions();

        setMaxFileSize(Number(sizeConfig.name) / 1024 / 1024); // MB 단위 변환
        setAllowedExtensions(extensionConfig.map((e) => e.name.toLowerCase()));
      } catch (error) {
        const apiError = error as ApiError;
        if (apiError.response?.status === 401) return;
        const response = apiError.response?.data?.message;
        alert(response ?? "파일 설정 로딩 오류가 발생했습니다.");
        console.error("파일 설정 로딩 오류:", error);
      }
    }

    fetchFileConfig();
  }, []);

  // 파일 입력창 열기
  const openFileInput = () => {
    document.getElementById("fileUpload")?.click();
  };

  // 파일 업로드 핸들러
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFiles = Array.from(e.target.files || []);

    //업로드 가능한 확장자, 용량의 파일을 담을 배열
    const validFiles: File[] = [];

    //업로드된 파일 배열을 돌면서 체크
    uploadedFiles.forEach((file) => {
      const ext = file.name.split(".").pop()?.toLowerCase();
      // 1) 확장자 체크
      const isAllowed = ext != null && allowedExtensions.includes(ext);
      if (!isAllowed) {
        if (!isAllowed) {
          alert(`허용되지 않은 확장자입니다: ${file.name}`);
          return;
        }
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
        return;
      }
      validFiles.push(file);
    });

    // 검증된 파일만 반영
    if (validFiles.length > 0) {
      setFormData((prev) => ({
        ...prev,
        file: [...(prev.file ?? []), ...validFiles],
      }));
    }
  };

  // 기존 파일 삭제 핸들러
  const handleRemoveExistingFile = (fileId: number) => {
    // 1. 화면에 표시되는 기존 파일 목록에서 제거
    setMeetingFiles((prev) => prev.filter((file) => file.fileId !== fileId));

    // 2. 삭제할 파일 ID 목록에 추가
    setRemovedFileIds((prev) => {
      if (!prev.includes(fileId)) {
        return [...prev, fileId];
      }
      return prev;
    });
  };

  //  신규 파일 제거 핸들러
  const handleRemoveNewFile = (idx: number) => {
    setFormData((prev) => ({
      ...prev,
      file: prev.file?.filter((_, i) => i !== idx),
    }));
  };

  // 관련 부서 다중 선택
  const handleDepartmentChange = (selected: string[]) => {
    setFormData((prev) => ({
      ...prev,
      departmentIds: selected,
    }));
  };

  const handleSelectDateTime = (value: Dayjs | null) => {
    if (!value) return;

    setFormData((prev) => ({
      ...prev,
      startDate: value.format("YYYY-MM-DD HH:mm"),
    }));
  };

  const onIssueSelect = async (selectedId: string) => {
    try {
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
            ? issue.departmentIds
            : [],
          members: issue.members, // IssueMemberDto[]
        };
        return updatedFormData;
      });

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

  const normalizeDateTime = (value: string) =>
    dayjs(value).format("YYYY-MM-DD HH:mm");

  const handleSubmit = async () => {
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

    if (formData.status === "COMPLETED") {
      const isConfirmed = window.confirm(
        "회의 상태를 진행 완료로 변경하면, 이후 관리자만 수정할 수 있게 됩니다. 수정하시겠습니까?"
      );
      if (!isConfirmed) {
        return;
      }
    } else {
      if (!window.confirm("수정하시겠습니까?")) return;
    }

    const formDataObj = new FormData();

    const meetingDto = {
      title: formData.title,
      content: formData.content,
      status: formData.status,
      host: formData.host,
      issueId: Number(formData.issue),
      startDate: normalizedStartDate,
      endDate: formData.endDate ?? "",
      categoryId: Number(formData.categoryId),
      departmentIds: formData.departmentIds.map(Number),
      members: meetingMembers,
      isDel: false,
    };

    formDataObj.append(
      "data",
      new Blob([JSON.stringify(meetingDto)], { type: "application/json" })
    );

    formData.file?.forEach((file) => formDataObj.append("file", file));

    // 삭제할 파일 ID 목록 removeFileIds에 추가
    if (removedFileIds.length > 0) {
      formDataObj.append(
        "removeFileIds",
        new Blob([JSON.stringify(removedFileIds)], { type: "application/json" })
      );
    }

    try {
      setIsSaving(true);
      await updateMeeting(meetingId as string, formDataObj);
      alert("회의가 수정되었습니다.");
      navigate(`/meeting/${meetingId}`);
    } catch (error) {
      const apiError = error as ApiError;
      if (apiError.response?.status === 401) return;
      const response = apiError.response?.data?.message;
      alert(response ?? "회의 수정 중 오류가 발생했습니다.");
      console.error("회의 수정 실패:", error);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "80vh",
          width: "100%",
          minWidth: "1000px",
        }}
      >
        <CircularProgress color="primary" />
      </Box>
    );
  }

  return (
    <>
      <MeetingForm
        mode="update"
        formData={formData}
        issues={issues}
        categories={categories}
        departments={departments}
        meetingFiles={meetingFiles}
        initialMembers={meetingMembers} // 기존 참여자 목록 전달
        isSaving={isSaving}
        maxFileSize={maxFileSize}
        allowedExtensions={allowedExtensions}
        onIssueSelect={onIssueSelect}
        onChangeFormData={(key, value) =>
          setFormData((prev) => ({ ...prev, [key]: value }))
        }
        onFileUpload={handleFileUpload}
        onFileRemove={handleRemoveNewFile}
        onRemoveExistingFile={handleRemoveExistingFile}
        onOpenFileInput={openFileInput}
        onSelectDateTime={handleSelectDateTime}
        onDepartmentChange={handleDepartmentChange}
        onChangeMembers={setMeetingMembers}
        onSubmit={handleSubmit}
      />
    </>
  );
}
