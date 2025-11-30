export interface Login {
  loginId: string;
  password: string;
}

export interface Member {
  loginId: string;
  password: string;
  name: string;
  departmentId: number | "";
  jobPositionId: number | "";
  phone: string;
  email: string;
  isEmployed: boolean;
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
