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
  profileUrl?: string;
}

export interface MemberList {
  id: number;
  name: string;
  departmentName: string;
  jobPositionName: string;
  phone: string;
  email: string;
  isEmployed: string;
}
