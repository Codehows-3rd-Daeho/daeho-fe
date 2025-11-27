//** 기준정보 (부서, 직급, 카테고리) API */

import axios from "axios";
import { BASE_URL } from "../../config/BaseUrl";
import { getAxiosAuthHeaders } from "./MemberApi";
import type { MasterDataType } from "../type/SettingType";

// GET
export const getJobPosition = async (): Promise<MasterDataType[]> => {
  const response = await axios.get(`${BASE_URL}/masterData/jobPosition`);
  console.log("직급 : ", response.data);
  return response.data;
};

export const getDepartment = async (): Promise<MasterDataType[]> => {
  const response = await axios.get(`${BASE_URL}/masterData/department`);
  console.log("부서 :", response.data);
  return response.data;
};

export const getCategory = async (): Promise<MasterDataType[]> => {
  const response = await axios.get(`${BASE_URL}/masterData/category`);
  console.log("카테고리 :", response.data);

  return response.data;
};

// POST
export const createDepartment = async (data: MasterDataType) => {
  const response = await axios.post(
    `${BASE_URL}/admin/department`,
    data,
    getAxiosAuthHeaders()
  );
  return response.data;
};

export const createJobPosition = async (data: MasterDataType) => {
  const response = await axios.post(
    `${BASE_URL}/admin/jobPosition`,
    data,
    getAxiosAuthHeaders()
  );
  return response.data;
};

export const createCategory = async (data: MasterDataType) => {
  const response = await axios.post(
    `${BASE_URL}/admin/category`,
    data,
    getAxiosAuthHeaders()
  );
  return response.data;
};

// DELETE
export const deleteDepartment = async (id: number): Promise<void> => {
  await axios.delete(
    `${BASE_URL}/admin/department/${id}`,
    getAxiosAuthHeaders()
  );
};

export const deleteJobPosition = async (id: number): Promise<void> => {
  await axios.delete(
    `${BASE_URL}/admin/jobPosition/${id}`,
    getAxiosAuthHeaders()
  );
};

export const deleteCategory = async (id: number): Promise<void> => {
  await axios.delete(`${BASE_URL}/admin/category/${id}`, getAxiosAuthHeaders());
};
