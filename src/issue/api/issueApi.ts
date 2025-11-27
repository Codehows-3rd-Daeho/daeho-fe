import { register } from "../../base/BaseApi";

export const issueRegister = async (formData: FormData) => {
  return await register("issue", formData);
};
