import axios from "axios";
import { BASE_URL } from "../../config/httpClient";

//등록
export const issueRegister = async (formData: FormData) => {
  await axios.post(`${BASE_URL}/issue/register`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};
