import { useNavigate, useParams } from "react-router-dom";
import IssueForm from "./IssueForm";
import type { FileDto, IssueFormValues, IssueMemberDto } from "../type/type";
import { useEffect, useState } from "react";
import type { MasterDataType } from "../../admin/setting/type/SettingType";
import { getIssueDtl, updateIssue } from "../api/issueApi";
import {
  getCategory,
  getDepartment,
} from "../../admin/setting/api/MasterDataApi";
import { Box, CircularProgress } from "@mui/material";
import type { DateRangeType } from "./IssueCreate";
import dayjs from "dayjs";
import {
  getExtensions,
  getFileSize,
} from "../../admin/setting/api/FileSettingApi";
import type { ApiError } from "../../config/httpClient";

export default function IssueUpdate() {
  const { issueId } = useParams<{ issueId: string }>();

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

  const [categories, setCategories] = useState<MasterDataType[]>([]);
  const [departments, setDepartments] = useState<MasterDataType[]>([]);
  const [issueMembers, setIssueMembers] = useState<IssueMemberDto[]>([]);
  const [issueFiles, setIssueFiles] = useState<FileDto[]>([]); // 기존에 등록된 파일 목록
  const [removedFileIds, setRemovedFileIds] = useState<number[]>([]); // 삭제할 기존 파일 id
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [maxFileSize, setMaxFileSize] = useState<number>(0);
  const [allowedExtensions, setAllowedExtensions] = useState<string[]>([]);

  const navigate = useNavigate();

  useEffect(() => {
    if (!issueId) {
      navigate("/issue/list");
      return;
    }
    (async function fetchData() {
      try {
        const issue = await getIssueDtl(issueId as string);
        const dpt = await getDepartment();
        const cate = await getCategory();

        setDepartments(dpt);
        setCategories(cate);

        //카테고리 이름으로 ID 찾기
        const selectedCategory = cate.find(
          (c) => c.name === issue.categoryName
        );
        const categoryId = selectedCategory ? String(selectedCategory.id) : "";
        // 부서 이름 배열로 ID 배열 찾기
        const departmentIds: string[] = issue.departmentName
          .map((name) => {
            const dept = dpt.find((d) => d.name === name);
            return dept ? String(dept.id) : undefined;
          })
          .filter((id): id is string => Boolean(id));

        // formData 초기화
        setFormData({
          title: issue.title,
          content: issue.content,
          file: [],
          status: issue.status,
          host: `${issue.hostName ?? ""} ${issue.hostJPName ?? ""}`,
          startDate: issue.startDate,
          endDate: issue.endDate,
          category: categoryId,
          department: departmentIds,
          members: issue.participantList,
          isDel: false,
          isPrivate: issue.isPrivate,
        });

        setIssueFiles(issue.fileList || []);
        setRemovedFileIds([]);

        // 날짜 범위 상태 초기화
        setRange([
          {
            startDate: dayjs(issue.startDate).toDate(),
            endDate: dayjs(issue.endDate).toDate(),
            key: "selection",
          },
        ]);

        // 참여자 초기화
        setIssueMembers(issue.participantList);
      } catch (error) {
        const apiError = error as ApiError;
        if (apiError.response?.status === 401) return;
        const response = apiError.response?.data?.message;

        alert(response ?? "오류가 발생했습니다.");
        console.error("이슈 데이터 로딩 중 오류 발생:", error);
        navigate(`/issue/${issueId}`);
      } finally {
        setIsLoading(false);
      }
    })();
  }, [issueId, navigate]);

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

  const isValidDateFormat = (date: string) =>
    dayjs(date, "YYYY-MM-DD", true).isValid();

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
    if (!formData.endDate) {
      alert("마감일을 선택해주세요.");
      return;
    }
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

    if (formData.status === "COMPLETED") {
      const isConfirmed = window.confirm(
        "이슈 상태를 진행 완료로 변경하면, 이후 관리자만 수정할 수 있게 됩니다. 수정하시겠습니까?"
      );
      if (!isConfirmed) {
        return;
      }
    } else {
      if (!window.confirm("수정하시겠습니까?")) return;
    }

    const formDataObj = new FormData();

    const issueDto = {
      issueId: issueId,
      title: formData.title,
      content: formData.content,
      status: formData.status,
      host: formData.host,
      startDate: formData.startDate,
      endDate: formData.endDate ?? "",
      categoryId: Number(formData.category),
      departmentIds: formData.department.map(Number),
      members: issueMembers,
      isDel: false,
      isPrivate: formData.isPrivate,
    };

    // issueDto data에 추가
    formDataObj.append(
      "data",
      new Blob([JSON.stringify(issueDto)], { type: "application/json" })
    );

    // 신규 파일 file에 추가
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
      await updateIssue(issueId as string, formDataObj);
      alert("이슈가 수정되었습니다!");
      navigate(`/issue/${issueId}`);
    } catch (error) {
      const apiError = error as ApiError;
      if (apiError.response?.status === 401) return;
      const response = apiError.response?.data?.message;

      alert(response ?? "이슈 수정 중 오류가 발생했습니다.");
    } finally {
      setIsSaving(false);
    }
  };

  // 파일 입력창 열기
  const openFileInput = () => {
    document.getElementById("fileUpload")?.click();
  };

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
        return;
      }

      //확장자, 용량 체크 성공한 file만 배열에 추가
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
    setIssueFiles((prev) => prev.filter((file) => file.fileId !== fileId));

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
      department: selected, // 문자열 → 숫자
    }));
  };

  // range : 현재 달력에서 선택된 날짜 범위를 담는 상태
  const [range, setRange] = useState([
    {
      startDate: new Date(), //오늘 날짜
      endDate: new Date(),
      key: "selection",
    },
  ]);

  //DatePicker와 TextField연결
  const handleSelect = (selection: DateRangeType) => {
    setRange([selection]); // 달력 선택 반영
    setFormData((prev) => ({
      ...prev,
      startDate: dayjs(selection.startDate).format("YYYY-MM-DD"),
      endDate: dayjs(selection.endDate).format("YYYY-MM-DD"),
    })); // TextField에 반영
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
    <IssueForm
      mode="update"
      formData={formData}
      categories={categories}
      departments={departments}
      issueFiles={issueFiles} // 기존 파일 목록 전달
      initialMembers={issueMembers} // 기존 참여자 목록 전달
      range={range}
      isSaving={isSaving}
      maxFileSize={maxFileSize}
      allowedExtensions={allowedExtensions}
      onChangeFormData={(key, value) =>
        setFormData((prev) => ({ ...prev, [key]: value }))
      }
      onFileUpload={handleFileUpload}
      onFileRemove={handleRemoveNewFile}
      onRemoveExistingFile={handleRemoveExistingFile}
      onOpenFileInput={openFileInput}
      onDepartmentChange={handleDepartmentChange}
      onChangeMembers={setIssueMembers}
      onSelectRange={handleSelect}
      onSubmit={handleSubmit}
    />
  );
}
