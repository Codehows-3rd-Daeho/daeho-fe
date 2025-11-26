import { Box, Chip } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import React, { useEffect, useState } from "react";
import MasterData from "../../components/setting/MasterData";
import type {
  MasterDataType,
  NotificationSettingType,
} from "../../type/SettingType";
import NotificationSetting from "../../components/setting/NotificationSetting";
import {
  getDepartment,
  getJobPosition,
  getCategory,
  deleteDepartment,
  deleteJobPosition,
  deleteCategory,
} from "../../api/MasterDataApi";
import FileSetting from "../../components/setting/FileSetting";

export interface TagItem {
  id: number;
  label: string;
}

export type SetTagList = React.Dispatch<React.SetStateAction<TagItem[]>>;

// 💡 API 응답을 TagItem 구조로 변환하는 헬퍼 함수
const mapApiDataToTagItem = (data: MasterDataType[]): TagItem[] => {
  return data.map((item) => ({
    id: item.id || Date.now(), // id가 없을 경우 임시 값 부여
    label: item.name,
  }));
};

// 더미 데이터
const initialFileExtensions: TagItem[] = [
  { id: 11, label: "png" },
  { id: 12, label: "jpg" },
  { id: 13, label: "mp3" },
];

export default function AdminSetting() {
  // 💡 초기값을 빈 배열로 변경
  const [departments, setDepartments] = useState<TagItem[]>([]);
  const [jobPositions, setJobPositions] = useState<TagItem[]>([]);
  const [categories, setCategories] = useState<TagItem[]>([]);
  const [fileExtensions, setFileExtensions] = useState<TagItem[]>(
    initialFileExtensions
  );

  useEffect(() => {
    const fetchMasterData = async () => {
      try {
        // 부서 목록
        const deptResponse = await getDepartment();
        setDepartments(mapApiDataToTagItem(deptResponse));

        // 직급 목록
        const jobResponse = await getJobPosition();
        setJobPositions(mapApiDataToTagItem(jobResponse));

        // 카테고리 목록
        const catResponse = await getCategory();
        setCategories(mapApiDataToTagItem(catResponse));
      } catch (error) {
        console.error("기준 정보 로드 실패:", error);
        alert("기준 정보 로드에 실패했습니다.");
      }
    };

    fetchMasterData();
  }, []);

  const [notificationSetting, setNotificationSetting] =
    useState<NotificationSettingType>({
      allIssue: true,
      allMeeting: true,
      allComment: true,
      issueCreated: true,
      issueUpdated: true,
      issueStatus: true,
      meetingCreated: true,
      meetingUpdated: true,
      meetingStatus: true,
      commentCreated: true,
      commentUpdated: true,
      commentMention: true,
    });

  const RenderChips = ({
    list,
    setList,
    deleteApiFunction,
  }: {
    list: TagItem[];
    setList: SetTagList;
    deleteApiFunction: (id: number) => Promise<void>;
  }) => (
    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 1 }}>
      {list.map((data) => (
        <Chip
          key={data.id}
          label={data.label}
          deleteIcon={<CloseIcon sx={{ fontSize: "16px" }} />}
          onDelete={() => handleDelete(list, setList, data, deleteApiFunction)}
          // sx={{
          //   fontSize: "13px",
          //   height: "24px",
          //   borderRadius: "6px",
          //   backgroundColor: "#FAFAFA",
          //   border: "1px solid #E5E7EB",
          //   color: "#374151",
          //   "& .MuiChip-deleteIcon": {
          //     fontSize: "16px",
          //     color: "#9CA3AF",
          //     "&:hover": { color: "#6B7280" },
          //   },
          // }}
          sx={{
            fontSize: "13px",
            height: "24px",
            backgroundColor: "#E7F3FF",
            borderRadius: "6px",
            color: "#1A73E8",
            fontWeight: 500,
            "& .MuiChip-deleteIcon": {
              color: "#1A73E8",
              fontSize: "18px",
              "&:hover": {
                color: "#155AB6",
              },
            },
          }}
        />
      ))}
    </Box>
  );

  // Chip 삭제 핸들러
  const handleDelete = async (
    list: TagItem[],
    setList: SetTagList,
    chipToDelete: TagItem,
    deleteApiFunction: (id: number) => Promise<void>
  ) => {
    try {
      await deleteApiFunction(chipToDelete.id);

      setList((chips) => chips.filter((chip) => chip.id !== chipToDelete.id));

      console.log(`ID ${chipToDelete.id} 삭제 성공`);
    } catch (error) {
      console.error("삭제 실패:", error);
      alert("삭제 중 오류가 발생했습니다.");
    }
  };

  // 알림 스위치 핸들러
  const handleSwitchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = event.target;
    setNotificationSetting((prev) => ({
      ...prev,
      [name]: checked,
    }));

    if (name === "allIssue") {
      setNotificationSetting((prev) => ({
        ...prev,
        issueCreated: checked,
        issueUpdated: checked,
        issueStatus: checked,
      }));
    } else if (name === "allMeeting") {
      setNotificationSetting((prev) => ({
        ...prev,
        meetingCreated: checked,
        meetingUpdated: checked,
        meetingStatus: checked,
      }));
    } else if (name === "allComment") {
      setNotificationSetting((prev) => ({
        ...prev,
        commentCreated: checked,
        commentUpdated: checked,
        commentMention: checked,
      }));
    }
  };

  const handleSaveSettings = () => {
    console.log("설정 저장됨:", notificationSetting);
    alert("알림 설정이 저장되었습니다.");
  };

  return (
    <Box sx={{ p: 4, margin: "auto", width: 600 }}>
      <Box sx={{ mb: 6 }}>
        <MasterData
          departments={departments}
          setDepartments={setDepartments}
          jobPositions={jobPositions}
          setJobPositions={setJobPositions}
          categories={categories}
          setCategories={setCategories}
          RenderChips={(props) => (
            <RenderChips
              {...props}
              // RenderChips가 MasterData로부터 받은 list 이름에 따라 API를 결정
              deleteApiFunction={
                props.list === departments
                  ? deleteDepartment
                  : props.list === jobPositions
                  ? deleteJobPosition
                  : deleteCategory
              }
            />
          )}
        />
      </Box>
      <Box sx={{ mb: 6 }}>
        <FileSetting
          fileExtensions={fileExtensions}
          setFileExtensions={setFileExtensions}
          RenderChips={(props) => (
            <RenderChips
              {...props} // FileManager는 삭제 API가 없으므로 더미 함수 전달
              deleteApiFunction={async () => {
                // API 호출 없이 로컬 상태만 변경됨
                console.log("파일 확장자 삭제: API 호출 없음");
              }}
            />
          )}
        />
      </Box>
      <NotificationSetting
        notificationSetting={notificationSetting}
        handleSwitchChange={handleSwitchChange}
        handleSaveSettings={handleSaveSettings}
      />
    </Box>
  );
}
