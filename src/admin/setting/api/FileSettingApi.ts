import httpClient from "../../../config/httpClient";
import type { MasterDataType } from "../type/SettingType";

// GET
export const getFileSize = async (): Promise<MasterDataType> => {
  const response = await httpClient.get("/file/size");
  return response.data;
};

export const getExtensions = async (): Promise<MasterDataType[]> => {
  const response = await httpClient.get("/file/extension");
  return response.data;
};

// POST
export const saveFileSize = async (data: MasterDataType) => {
  const response = await httpClient.post(`/admin/file/size`, data);
  return response.data;
};

export const saveExtension = async (data: MasterDataType) => {
  const response = await httpClient.post(`/admin/file/extension`, data);
  return response.data;
};

// DELETE
export const deleteExtension = async (id: number): Promise<void> => {
  await httpClient.delete(`/admin/file/extension/${id}`);
};
