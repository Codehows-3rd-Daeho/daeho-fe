import { Box, Chip, CircularProgress } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import React, { useEffect, useState } from "react";
import type {
  MasterDataType,
  NotificationSettingType,
} from "../type/SettingType";
import {
  getDepartment,
  getJobPosition,
  getCategory,
  deleteDepartment,
  deleteJobPosition,
  deleteCategory,
  getNotiSetting,
  saveNotiSetting,
} from "../api/MasterDataApi";
import axios from "axios";
import MasterData from "../component/MasterData";
import FileSetting from "../component/FileSetting";
import NotificationSetting from "../component/NotificationSetting";
import { deleteExtension, getExtensions } from "../api/FileSettingApi";
import GroupManagement from "../component/Group";

export interface TagItem {
  id: number;
  label: string;
}

export type SetTagList = React.Dispatch<React.SetStateAction<TagItem[]>>;

const mapApiDataToTagItem = (data: MasterDataType[]): TagItem[] => {
  return data.map((item) => ({
    id: item.id || Date.now(), // id가 없을 경우 임시 값
    label: item.name,
  }));
};

export default function AdminSetting() {
  const [departments, setDepartments] = useState<TagItem[]>([]);
  const [jobPositions, setJobPositions] = useState<TagItem[]>([]);
  const [categories, setCategories] = useState<TagItem[]>([]);
  const [fileExtensions, setFileExtensions] = useState<TagItem[]>([]);
  const [notificationSetting, setNotificationSetting] =
    useState<NotificationSettingType>({
      allIssue: true,
      allMeeting: true,
      allComment: true,
      issueCreated: true,
      issueStatus: true,
      meetingCreated: true,
      meetingStatus: true,
      commentMention: true,
    });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchMasterData = async () => {
      try {
        setIsLoading(true);
        // 부서 목록
        const deptResponse = await getDepartment();
        setDepartments(mapApiDataToTagItem(deptResponse));

        // 직급 목록
        const jobResponse = await getJobPosition();
        setJobPositions(mapApiDataToTagItem(jobResponse));

        // 카테고리 목록
        const catResponse = await getCategory();
        setCategories(mapApiDataToTagItem(catResponse));

        // 파일 확장자 목록
        const extResponse = await getExtensions();
        setFileExtensions(mapApiDataToTagItem(extResponse));

        // 알림 설정
        const notificationSetting = await getNotiSetting();
        setNotificationSetting((prev) => ({
          ...prev,
          issueCreated: notificationSetting.issueCreated,
          issueStatus: notificationSetting.issueStatus,
          meetingCreated: notificationSetting.meetingCreated,
          meetingStatus: notificationSetting.meetingStatus,
          commentMention: notificationSetting.commentMention,
          allIssue:
            notificationSetting.issueCreated && notificationSetting.issueStatus,
          allMeeting:
            notificationSetting.meetingCreated &&
            notificationSetting.meetingStatus,
          allComment: notificationSetting.commentMention,
        }));
        setIsLoading(false);
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 401) {
          return;
        }
        console.error("기준 정보 로드 실패:", error);
        alert("기준 정보 로드에 실패했습니다.");
      }
    };

    fetchMasterData();
  }, []);

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
          onDelete={() => handleDelete(setList, data, deleteApiFunction)}
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
    setList: SetTagList,
    chipToDelete: TagItem,
    deleteApiFunction: (id: number) => Promise<void>
  ) => {
    try {
      await deleteApiFunction(chipToDelete.id);
      setList((chips) => chips.filter((chip) => chip.id !== chipToDelete.id));
      alert("삭제되었습니다.");
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response) {
        const status = error.response.status;
        const errorMessage = error.response.data;

        if (status === 401) {
          // 401 에러는 전역 인터셉터에서 이미 처리하므로 여기선 그냥 return
          return;
        } else if (status === 409 || status === 404) {
          alert(`${errorMessage}`);
        } else {
          alert(`오류 발생 (상태 코드: ${status})`);
        }
      } else {
        console.error("삭제 실패:", error);
        alert("삭제 중 오류가 발생했습니다.");
      }
    }
  };

  // 알림 스위치 핸들러
  const handleSwitchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = event.target;

    setNotificationSetting((prev) => {
      const updated = { ...prev, [name]: checked };

      // 전체 스위치 연동
      if (name === "allIssue") {
        updated.issueCreated = checked;
        updated.issueStatus = checked;
      } else if (name === "allMeeting") {
        updated.meetingCreated = checked;
        updated.meetingStatus = checked;
      } else if (name === "allComment") {
        updated.commentMention = checked;
      } else if (name === "issueCreated" || name === "issueStatus") {
        updated.allIssue = updated.issueCreated && updated.issueStatus;
      } else if (name === "meetingCreated" || name === "meetingStatus") {
        updated.allMeeting = updated.meetingCreated && updated.meetingStatus;
      } else if (name === "commentMention") {
        updated.allComment = updated.commentMention;
      }

      return updated;
    });
  };

  const handleSaveSettings = async () => {
    try {
      await saveNotiSetting({
        issueCreated: notificationSetting.issueCreated,
        issueStatus: notificationSetting.issueStatus,
        meetingCreated: notificationSetting.meetingCreated,
        meetingStatus: notificationSetting.meetingStatus,
        commentMention: notificationSetting.commentMention,
      } as NotificationSettingType);

      // 저장 후 다시 로드
      const updatedSetting = await getNotiSetting();
      setNotificationSetting({
        ...updatedSetting,
        allIssue: updatedSetting.issueCreated && updatedSetting.issueStatus,
        allMeeting:
          updatedSetting.meetingCreated && updatedSetting.meetingStatus,
        allComment: updatedSetting.commentMention,
      });

      alert("알림 설정 저장 완료");
    } catch (error) {
      console.error("알림 설정 저장 실패:", error);
      alert("저장 실패");
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
        <GroupManagement />
      </Box>
      <Box sx={{ mb: 6 }}>
        <FileSetting
          fileExtensions={fileExtensions}
          setFileExtensions={setFileExtensions}
          RenderChips={(props) => (
            <RenderChips {...props} deleteApiFunction={deleteExtension} />
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
