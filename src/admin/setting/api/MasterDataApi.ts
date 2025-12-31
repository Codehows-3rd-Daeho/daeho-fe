//** 기준정보 (부서, 직급, 카테고리) API */
import type {
  Group,
  GroupDto,
  MasterDataType,
  NotificationSettingType,
} from "../type/SettingType";
import httpClient from "../../../config/httpClient";

// GET
//직급 리스트
export const getJobPosition = async (): Promise<MasterDataType[]> => {
  const response = await httpClient.get(`/masterData/jobPosition`);
  return response.data;
};

//부서 리스트
export const getDepartment = async (): Promise<MasterDataType[]> => {
  const response = await httpClient.get(`/masterData/department`);
  return response.data;
};

//카테고리 리스트
export const getCategory = async (): Promise<MasterDataType[]> => {
  const response = await httpClient.get(`/masterData/category`);
  return response.data;
};

//그룹 리스트
export const getGroupList = async (): Promise<Group[]> => {
  const response = await httpClient.get(`/masterData/group`);
  return response.data;
};

// 알림 설정
export const getNotiSetting = async (): Promise<NotificationSettingType> => {
  const response = await httpClient.get(`/admin/notificationSetting`);
  return response.data;
};

// POST
export const createDepartment = async (data: MasterDataType) => {
  const response = await httpClient.post(`/admin/department`, data);
  return response.data;
};

export const createJobPosition = async (data: MasterDataType) => {
  const response = await httpClient.post(`/admin/jobPosition`, data);
  return response.data;
};

export const createCategory = async (data: MasterDataType) => {
  const response = await httpClient.post(`/admin/category`, data);
  return response.data;
};

export const createGroup = async (data: GroupDto) => {
  const response = await httpClient.post(`/admin/group`, data);
  return response.data;
};

export const saveNotiSetting = async (data: NotificationSettingType) => {
  const response = await httpClient.post(`/admin/notificationSetting`, data);
  return response.data;
};

// 그룹 수정
export const updateGroup = async (id: number, data: GroupDto) => {
  const response = await httpClient.put(`/admin/group/${id}`, data);
  return response.data;
};

// DELETE
export const deleteDepartment = async (id: number): Promise<void> => {
  await httpClient.delete(`/admin/department/${id}`);
};

export const deleteJobPosition = async (id: number): Promise<void> => {
  await httpClient.delete(`/admin/jobPosition/${id}`);
};

export const deleteCategory = async (id: number): Promise<void> => {
  await httpClient.delete(`/admin/category/${id}`);
};

export const deleteGroup = async (id: number): Promise<void> => {
  await httpClient.delete(`/admin/group/${id}`);
};
