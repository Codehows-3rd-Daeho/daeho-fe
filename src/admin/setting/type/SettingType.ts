import type { PartMemberList } from "../../../issue/type/type";

// 기준정보
export interface MasterDataType {
  id?: number;
  name: string;
}

export interface NotificationSettingType {
  // 전체 설정
  allIssue: boolean;
  allMeeting: boolean;
  allComment: boolean;

  // 이슈 설정
  issueCreated: boolean;
  issueUpdated: boolean;
  issueStatus: boolean;

  // 회의 설정
  meetingCreated: boolean;
  meetingUpdated: boolean;
  meetingStatus: boolean;

  // 댓글 설정
  commentCreated: boolean;
  commentUpdated: boolean;
  commentMention: boolean;
}

// 그룹 등록시 사용
export interface GroupDto {
  groupName: string;
  memberIds: number[];
}

export interface Group {
  id: number;
  groupName: string;
  members: PartMemberList[];
}
