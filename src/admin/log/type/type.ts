export interface LogList {
  id: number;
  title: string;
  targetId: number;
  targetType: string;
  changeType: string;
  message: string;
  updateField: string;
  createTime: Date;
  memberName: string;
  no?: number;
}
