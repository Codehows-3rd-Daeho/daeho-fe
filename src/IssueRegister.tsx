// import BaseForm from "./BaseForm";
// import { Register } from "./IssueApi";
// import type { BaseFormValues } from "./type";

// export default function IssueRegister() {
//   const initialValues: BaseFormValues = {
//     title: "", // 제목
//     content: "", // 내용
//     file: [], // 첨부 파일 (다중)
//     status: "진행전", // 상태 (예: 완료 여부)
//     host: "", // 작성자
//     startDate: "", // 시작일
//     endDate: "", // 종료일 (선택)
//     category: "", // 카테고리
//     department: [], // 관련 부서 (다중)
//     member: [], // 관련 멤버 (다중)
//   };

//   const handleSubmit = async () => {
//     console.log("회의 등록:", initialValues);
//     Register();
//   };

//   return (
//     <BaseForm
//       initialValues={{
//         ...initialValues,
//         onSubmit: handleSubmit,
//       }}
//     />
//   );
// }
