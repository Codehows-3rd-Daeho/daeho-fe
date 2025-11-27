import axios from "axios";

export const BASE_URL = import.meta.env.VITE_API_URL;

//등록
export const issueRegister = async (formData: FormData) => {
  await axios.post(`${BASE_URL}/issue/register`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};
