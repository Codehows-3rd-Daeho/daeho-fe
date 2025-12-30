import type {
  MeetingDto,
  MeetingListItem,
  MeetingListResponse,
} from "../type/type";
import httpClient from "../../config/httpClient";

// 회의 목록 조회(페이징)
export const getMeetingList = async (
  page: number,
  size: number = 10
): Promise<MeetingListResponse> => {
  const response = await httpClient.get(`/meeting/list`, {
    params: { page, size },
  });
  return response.data; // { content, totalElements }
};

//나의 업무 회의 목록
export const getMeetingListMT = async (
  id: number,
  page: number,
  size: number = 10
): Promise<MeetingListResponse> => {
  const response = await httpClient.get(`/meeting/mytask/${id}`, {
    params: { page, size },
  });
  return response.data; // { content, totalElements }
};

//회의 캘린더 조회
export const getMeetingMonth = async (
  year: number,
  month: number
): Promise<MeetingListItem[]> => {
  const response = await httpClient.get(`/meeting/scheduler`, {
    params: { year, month },
  });
  return response.data; // { content, totalElements }
};

//나의 업무 회의 캘린더
//회의 캘린더 조회
export const getMeetingMonthMT = async (
  id: number,
  year: number,
  month: number
): Promise<MeetingListItem[]> => {
  const response = await httpClient.get(`/meeting/scheduler/mytask/${id}`, {
    params: { year, month },
  });
  return response.data; // { content, totalElements }
};

//등록
export const meetingCreate = async (formData: FormData) => {
  const response = await httpClient.post(`/meeting/create`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

// 상세 조회
export const getMeetingDtl = async (meetingId: string): Promise<MeetingDto> => {
  const response = await httpClient.get(`/meeting/${meetingId}`);
  return response.data;
};

// 상세 조회 - 참여자의 회의 확인 상태 업데이트
export const updateMeetingReadStatus = async (
  meetingId: string
): Promise<void> => {
  await httpClient.put(`/meeting/${meetingId}/readStatus`);
};

// 수정
export const updateMeeting = async (meetingId: string, formData: FormData) => {
  const response = await httpClient.put(`/meeting/${meetingId}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

// 삭제
export const deleteMeeting = async (meetingId: string): Promise<void> => {
  const response = await httpClient.delete(`/meeting/${meetingId}`);
  return response.data;
};

// 회의록 등록
export const saveMeetingMinutes = async (
  meetingId: string,
  formData: FormData
) => {
  await httpClient.post(`/meeting/${meetingId}/meetingMinutes`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

// 회의록 삭제
export const deleteMeetingMinutes = async (
  meetingId: string,
  fileId: string
): Promise<void> => {
  const response = await httpClient.delete(
    `/meeting/${meetingId}/meetingMinutes/${fileId}`
  );
  return response.data;
};
