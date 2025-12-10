import type { MeetingDtlDto, MeetingListResponse } from "../type/type";
import httpClient from "../../config/httpClient";

// 회의 목록 조회
export const getMeetingList = async (
  page: number,
  size: number = 10
): Promise<MeetingListResponse> => {
  const response = await httpClient.get(`/meeting`, {
    params: { page, size },
  });
  return response.data; // { content, totalElements }
};

//등록
export const meetingCreate = async (formData: FormData) => {
  await httpClient.post(`/meeting/create`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

// 상세 조회
export const getMeetingDtl = async (
  meetingId: string
): Promise<MeetingDtlDto> => {
  const response = await httpClient.get(`/meeting/${meetingId}`);
  console.log(response);
  return response.data;
};

// 상세 조회 - 참여자의 회의 확인 상태 업데이트
export const updateMeetingReadStatus = async (
  meetingId: string
): Promise<void> => {
  await httpClient.put(`/meeting/${meetingId}/readStatus`);
  console.log(`API: 회의 ${meetingId}의 읽음 상태를 '확인'으로 업데이트`);
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
