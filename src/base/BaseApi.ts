import axios from "axios";

export const BASE_URL = import.meta.env.VITE_API_URL;

// FormData 전송용 Base API
export const register = async (url: string, formData: FormData) => {
  await axios.post(`${BASE_URL}/${url}/register`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};
