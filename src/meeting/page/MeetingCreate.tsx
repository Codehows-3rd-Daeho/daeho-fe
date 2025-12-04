import { useEffect, useState } from "react";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import dayjs from "dayjs";
import { getCategory, getDepartment } from "../../admin/api/MasterDataApi";
import type { MasterDataType } from "../../admin/type/SettingType";
import { useAuthStore } from "../../store/useAuthStore";
import { getHostData } from "../../admin/api/MemberApi";
import { useNavigate } from "react-router-dom";
import MeetingForm from "./MeetingForm";
import type { MeetingFormValues, MeetingMemberDto } from "../type/type";
import { meetingCreate } from "../api/MeetingApi";

interface DateRangeType {
  startDate: Date;
  endDate: Date;
  key: string; //각 범위를 구분하기 위함
}

export default function MeetingCreate() {
  const [formData, setFormData] = useState<MeetingFormValues>({
    title: "",
    content: "",
    file: [],
    status: "PLANNED",
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
  const navigator = useNavigate();

  useEffect(() => {
    async function fetchData() {
      try {
        //===============부서, 주관자 조회===================
        const dep = await getDepartment();
        const cat = await getCategory();

        setDepartments(dep); // 부서 데이터 저장
        setCategories(cat); // 카테고리 데이터 저장

        //==================주관자 자동 입력==================
        if (memberId) {
          const hostData = await getHostData(memberId);
          const hostString = `${hostData.name} ${hostData.jobPositionName}`;

          setFormData((prev) => ({
            ...prev,
            host: hostString,
          }));
        } else {
          console.log("memberId 없음:", memberId);
        }
      } catch (error) {
        console.log("데이터를 불러오는 중 오류 발생", error);
      }
    }
    fetchData();
  }, []);

  //======================저장===================================
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
    // 백엔드의 meetingDto에 매핑되어야 할 모든 필드(파일 제외)
    const meetingDto = {
      title: formData.title, //속성(키): 넣을 값 | 백엔드 Dto 필드명: 프론트 필드명
      content: formData.content,
      status: formData.status,
      host: formData.host,
      startDate: formData.startDate,
      endDate: formData.endDate ?? "",
      //서버로 전송 시 string -> Number 변환
      categoryId: Number(formData.category),
      departmentIds: formData.department.map(Number),
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

    //===================전송=========================
    try {
      console.log("보내는 데이터", meetingDto);
      await meetingCreate(formDataObj);

      alert("회의가 등록되었습니다!");
      navigator("/meeting/list");
    } catch (error) {
      console.error("회의 등록 실패:", error);
      alert("회의 등록 중 오류가 발생했습니다.");
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
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    //HTML input[type="file"]의 파일 목록 속성 이름은 files
    const newFiles = Array.from(e.target.files || []);

    setFormData((prev) => ({
      ...prev,
      // file?: File[] === file: File[] | undefined이기 때문에 undefined으로 인한 오류 방지
      file: [...(prev.file ?? []), ...newFiles],
    }));
  };

  // ===============================================================================================
  //                        부서
  // ===============================================================================================

  // 관련 부서 다중 선택
  const handleDepartmentChange = (selected: string[]) => {
    setFormData((prev) => ({
      ...prev,
      department: selected.map(Number), // 문자열 → 숫자
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
  //                          참석자
  // ===============================================================================================

  //partmember객체 받기
  const [meetingMembers, setMeetingMembers] = useState<MeetingMemberDto[]>([]);

  return (
    <>
      <MeetingForm
        formData={formData}
        categories={categories}
        departments={departments}
        range={range}
        onChangeFormData={(key, value) =>
          setFormData((prev) => ({ ...prev, [key]: value }))
        }
        onFileUpload={handleFileUpload}
        onFileRemove={(idx) =>
          setFormData((prev) => ({
            ...prev,
            file: prev.file?.filter((_, i) => i !== idx),
          }))
        }
        onOpenFileInput={openFileInput}
        onDepartmentChange={handleDepartmentChange}
        onChangeMembers={setMeetingMembers}
        onSelectRange={handleSelect}
        onSubmit={handleSubmit}
      />
    </>
  );
}
