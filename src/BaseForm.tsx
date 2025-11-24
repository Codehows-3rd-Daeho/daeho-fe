import {
  Box,
  Button,
  MenuItem,
  OutlinedInput,
  Select,
  Typography,
} from "@mui/material";
import { useState } from "react";
import type { BaseFormValues } from "./type";
import FormField from "./components/FormField";
import SelectField from "./components/SelectField";

export default function BaseForm() {
  const [formData, setFormData] = useState<BaseFormValues>({
    title: "",
    content: "",
    file: [],
    status: "진행전",
    createdBy: "",
    startDate: "",
    category: "일반업무",
    department: [],
    member: [],
    onSubmit: undefined,
  });

  return (
    <Box sx={{ display: "flex", gap: 2 }}>
      {/* 왼쪽 컬럼 */}
      <Box sx={{ flex: 1, display: "flex", flexDirection: "column", gap: 2 }}>
        <FormField
          label="제목"
          name="title"
          value={formData.title}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, title: e.target.value }))
          }
          required
        />
        <FormField
          label="본문"
          name="content"
          value={formData.content}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, content: e.target.value }))
          }
          required
          inputHeight="300px"
        />
        {/* 첨부파일 */}
      </Box>

      {/* 오른쪽 컬럼 */}
      <Box sx={{ flex: 1, display: "flex", flexDirection: "column", gap: 2 }}>
        <SelectField
          label="상태"
          name="status"
          value={formData.status}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              status: e.target.value as string,
            }))
          }
          required
          horizontal
          options={[
            { value: "진행전", label: "진행전" },
            { value: "진행중", label: "진행중" },
            { value: "진행 완료", label: "진행 완료" },
          ]}
        />
        <FormField
          label="주관자"
          name="createdBy"
          value={formData.createdBy}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, createdBy: e.target.value }))
          }
          required
          inputWidth="350px"
          horizontal
        />

        {/* 시작일, 마감일 */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "row", // 가로 정렬
            justifyContent: "center", // 수평 중앙 정렬
            alignItems: "center", // 수직 중앙 정렬
            gap: 2, // 요소 간 간격
          }}
        >
          <FormField
            label="시작일"
            name="startDate"
            value={formData.startDate}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, startDate: e.target.value }))
            }
            required
            inputWidth="220px"
          />
          <FormField
            label="마감일"
            name=""
            value={formData.endDate}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, endDate: e.target.value }))
            }
            required
            inputWidth="220px"
          />
        </Box>
        <SelectField
          label="카테고리"
          name="category"
          value={formData.category}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              category: e.target.value as string,
            }))
          }
          required
          horizontal
          options={[
            { value: "일반업무", label: "일반업무" },
            { value: "영업/고객", label: "영업/고객" },
            { value: "연구 개발", label: "연구 개발" },
          ]}
        />

        <SelectField
          label="관련 부서"
          name="department"
          value={formData.department}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              department: e.target.value as string[],
            }))
          }
          required
          horizontal
          multiple
          options={[
            { value: "기획", label: "기획" },
            { value: "디자인", label: "디자인" },
            { value: "개발", label: "개발" },
          ]}
        />
        {/* 버튼과 라벨 텍스트를 함께 넣기 */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <Typography sx={{ textAlign: "right" }}>참여자</Typography>
          <Button
            variant="outlined"
            sx={{
              height: "60px", // FormField 입력창 높이와 맞춤
              width: "350px",
            }}
          >
            참여자 추가
          </Button>
        </Box>
        <Button
          variant="outlined"
          sx={{
            width: "100px", // 원하는 너비
            alignSelf: "flex-end", // 부모 flex 방향에서 왼쪽 정렬
          }}
        >
          등록
        </Button>
      </Box>
    </Box>
  );
}
