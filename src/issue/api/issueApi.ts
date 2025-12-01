import axios from "axios";
import { getAxiosAuthHeaders } from "../../admin/api/MemberApi";
import { BASE_URL } from "../../config/BaseUrl";

//등록
export const issueCreate = async (formData: FormData) => {
  //헤더 로그 확인용
  console.log("헤더:", {
    headers: {
      ...getAxiosAuthHeaders().headers,
      // "Content-Type": "multipart/form-data",
    },
  });

  await axios.post(`${BASE_URL}/issue/create`, formData, {
    headers: {
      ...getAxiosAuthHeaders().headers,
      // "Content-Type": "multipart/form-data",
      // Authorization: `Bearer ${localStorage.getItem("accessToken")}`, //로그인시 받은 토큰
    },
  });
};
