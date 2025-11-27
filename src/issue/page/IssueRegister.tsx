import BaseForm from "../../base/BaseForm";
import { issueRegister } from "../api/issueApi";
import type { BaseFormValues } from "../type/type";

export default function IssueRegister() {
  const initialValues: BaseFormValues = {
    title: "", // 제목
    content: "", // 내용
    file: [], // 첨부 파일 (다중)
    status: "진행전", // 상태 (예: 완료 여부)
    host: "", // 작성자
    startDate: "", // 시작일
    endDate: "", // 종료일 (선택)
    category: "", // 카테고리
    department: [], // 관련 부서 (다중)
    member: [], // 관련 멤버 (다중)
  };

  // BaseForm에서 받은 values를 issueApi로 넘김
  const handleSubmit = async (formData: FormData) => {
    await issueRegister(formData);
    alert("이슈가 등록되었습니다!");
  };
  return (
    // initialValues는 그 타입(T)과 완전히 똑같은 구조(obj)여야 한다
    <BaseForm<BaseFormValues>
      initialValues={initialValues}
      onSubmit={handleSubmit}
    >
      {/* BaseForm 안에서 children을 추가해도 되고 BaseForm에 customFields 기능을 만들어도 됨 */}
    </BaseForm>
  );
}
