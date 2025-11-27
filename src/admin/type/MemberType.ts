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

export interface Login {
  loginId: string;
  password: string;
}
