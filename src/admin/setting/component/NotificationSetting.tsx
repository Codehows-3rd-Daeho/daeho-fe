import { Box, Typography, Switch, Divider, Button } from "@mui/material";
import React from "react";
import type { NotificationSettingType } from "../type/SettingType";

interface NotificationSettingsProps {
  notificationSetting: NotificationSettingType;
  handleSwitchChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleSaveSettings: () => void;
}

// 스위치 항목을 렌더링하는 공통 컴포넌트
interface SwitchItemProps {
  label: string;
  name: keyof NotificationSettingType;
  checked: boolean;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const SwitchItem: React.FC<SwitchItemProps> = ({
  label,
  name,
  checked,
  onChange,
}) => (
  <Box
    sx={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      py: 0.5,
    }}
  >
    <Typography variant="body1">{label}</Typography>
    <Switch checked={checked} onChange={onChange} name={name} />
  </Box>
);

export default function NotificationSetting({
  notificationSetting,
  handleSwitchChange,
  handleSaveSettings,
}: NotificationSettingsProps) {
  return (
    <Box sx={{ mb: 4 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        {/* 제목 왼쪽 정렬 보장 */}
        <Typography variant="h5" sx={{ fontWeight: 600, textAlign: "left" }}>
          전체 회원 알림 설정
        </Typography>
        <Button
          variant="outlined"
          color="primary"
          onClick={handleSaveSettings}
          size="small"
        >
          알림 설정 저장
        </Button>
      </Box>

      {/* 전체 알림 끄기 그룹 */}
      <Box>
        <Typography
          variant="subtitle1"
          gutterBottom
          sx={{ mt: 4, fontWeight: 600, textAlign: "left" }}
        >
          전체
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <Box sx={{ display: "flex", flexDirection: "column" }}>
          <SwitchItem
            label="이슈 알림 전체 끄기"
            name="allIssue"
            checked={notificationSetting.allIssue}
            onChange={handleSwitchChange}
          />
          <SwitchItem
            label="회의 알림 전체 끄기"
            name="allMeeting"
            checked={notificationSetting.allMeeting}
            onChange={handleSwitchChange}
          />
          <SwitchItem
            label="댓글 알림 전체 끄기"
            name="allComment"
            checked={notificationSetting.allComment}
            onChange={handleSwitchChange}
          />
        </Box>
      </Box>

      {/* 이슈 설정 그룹 */}
      <Box>
        <Typography
          variant="subtitle1"
          sx={{ mt: 4, fontWeight: 600, textAlign: "left" }}
        >
          이슈
        </Typography>
        <Divider sx={{ mt: 2, mb: 2 }} />
        <Box sx={{ display: "flex", flexDirection: "column" }}>
          <SwitchItem
            label="등록 시 알림 받기"
            name="issueCreated"
            checked={notificationSetting.issueCreated}
            onChange={handleSwitchChange}
          />
          <SwitchItem
            label="상태 변경 시 알림 받기"
            name="issueStatus"
            checked={notificationSetting.issueStatus}
            onChange={handleSwitchChange}
          />
        </Box>
      </Box>

      {/* 회의 설정 그룹 */}
      <Box>
        <Typography
          variant="subtitle1"
          sx={{ mt: 4, fontWeight: 600, textAlign: "left" }}
        >
          회의
        </Typography>
        <Divider sx={{ mt: 2, mb: 2 }} />
        <Box sx={{ display: "flex", flexDirection: "column" }}>
          <SwitchItem
            label="등록 시 알림 받기"
            name="meetingCreated"
            checked={notificationSetting.meetingCreated}
            onChange={handleSwitchChange}
          />
          <SwitchItem
            label="상태 변경 시 알림 받기"
            name="meetingStatus"
            checked={notificationSetting.meetingStatus}
            onChange={handleSwitchChange}
          />
        </Box>
      </Box>

      <Divider sx={{ mt: 2, mb: 2 }} />

      {/* 댓글 설정 그룹 */}
      <Box>
        <Typography
          variant="subtitle1"
          sx={{ mt: 4, fontWeight: 600, textAlign: "left" }}
        >
          댓글
        </Typography>
        <Box sx={{ display: "flex", flexDirection: "column" }}>
          <SwitchItem
            label="나를 멘션했을 때 알림 받기"
            name="commentMention"
            checked={notificationSetting.commentMention}
            onChange={handleSwitchChange}
          />
        </Box>
      </Box>
    </Box>
  );
}
