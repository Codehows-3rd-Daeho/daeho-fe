//** 기준정보 (부서, 직급, 카테고리) API */

import axios from "axios";
import { BASE_URL } from "../../config/BaseUrl";
import { getAxiosAuthHeaders } from "./MemberApi";
import type { MasterDataType } from "../type/SettingType";
import type { IssueMemberData } from "../../issue/type/type";

// GET
//직급 리스트
export const getJobPosition = async (): Promise<MasterDataType[]> => {
  const response = await axios.get(`${BASE_URL}/masterData/jobPosition`);
  console.log("직급 : ", response.data);
  return response.data;
};

//부서 리스트
export const getDepartment = async (): Promise<MasterDataType[]> => {
  const response = await axios.get(`${BASE_URL}/masterData/department`);
  console.log("부서 :", response.data);
  return response.data;
};

//카테고리 리스트
export const getCategory = async (): Promise<MasterDataType[]> => {
  const response = await axios.get(`${BASE_URL}/masterData/category`);
  console.log("카테고리 :", response.data);

  return response.data;
};
//멤버 정보
//회원 정보 GET 주관자 조회, 참여자 모달에 사용

//아이디를 보내서, 이름, 직급 조회
export const getHostData = async (
  memberId: number
): Promise<IssueMemberData> => {
  const response = await axios.get(
    `${BASE_URL}/masterData/partMember/${memberId}`
  );
  console.log("getHostData response:", response.data);
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
