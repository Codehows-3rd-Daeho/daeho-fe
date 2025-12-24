export interface Member {
  id?: number;
  loginId: string;
  password: string;
  name: string;
  departmentId: number | "";
  jobPositionId: number | "";
  phone: string;
  email: string;
  isEmployed: boolean;
  role: "ADMIN" | "USER";
  profileUrl?: string;
  profileFileId?: number;
}

export interface MemberList {
  id: number;
  name: string;
  departmentName: string;
  jobPositionName: string;
  phone: string;
  email: string;
  isEmployed: string;
  isAdmin: boolean;
}

//마이페이지
export interface MemberProfile {
  loginId: string;
  password: string;
  name: string;
  email: string;
  phone: string;
  departmentName: string | "";
  jobPositionName: string | "";
  profileUrl?: string;
}
