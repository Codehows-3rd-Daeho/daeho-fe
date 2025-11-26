
export interface Member {
  loginId: string;
  password: string;
  name: string;
  departmentId: number | ""; // 선택 전에는 빈 문자열
  jobPositionId: number | "";
  phone: string;
  email: string;
  isEmployed: boolean;
}

export interface Login {
  loginId: string;
  password: string;
}
