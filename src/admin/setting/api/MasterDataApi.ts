//** 기준정보 (부서, 직급, 카테고리) API */
import type { MasterDataType } from "../type/SettingType";
import httpClient from "../../../config/httpClient";

// GET
export const getJobPosition = async (): Promise<MasterDataType[]> => {
  const response = await httpClient.get(`/masterData/jobPosition`);
  console.log("직급 : ", response.data);
  return response.data;
};

export const getDepartment = async (): Promise<MasterDataType[]> => {
  const response = await httpClient.get(`/masterData/department`);
  console.log("부서 :", response.data);
  return response.data;
};

export const getCategory = async (): Promise<MasterDataType[]> => {
  const response = await httpClient.get(`/masterData/category`);
  console.log("카테고리 :", response.data);
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
