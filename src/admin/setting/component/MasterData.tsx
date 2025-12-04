import { Box, Typography, TextField, Divider } from "@mui/material";
import React, { useState } from "react";
import type { SetTagList, TagItem } from "../page/AdminSetting";
import {
  createCategory,
  createDepartment,
  createJobPosition,
} from "../api/MasterDataApi";
import type { MasterDataType } from "../type/SettingType";
import axios from "axios";

interface MasterDataProps {
  departments: TagItem[];
  setDepartments: SetTagList;
  jobPositions: TagItem[];
  setJobPositions: SetTagList;
  categories: TagItem[];
  setCategories: SetTagList;
  RenderChips: React.FC<{ list: TagItem[]; setList: SetTagList }>;
}

export default function MasterData({
  departments,
  setDepartments,
  jobPositions,
  setJobPositions,
  categories,
  setCategories,
  RenderChips,
}: MasterDataProps) {
  const [departmentInput, setDepartmentInput] = useState("");
  const [jobPositionInput, setJobPositionInput] = useState("");
  const [categoryInput, setCategoryInput] = useState("");

  // Enter 키를 눌렀을 때 실행될 핸들러 함수
  const handleAddTag = (
    event: React.KeyboardEvent<HTMLDivElement | HTMLInputElement>,
    input: string, // 입력값
    setInput: React.Dispatch<React.SetStateAction<string>>, // 입력값 setter
    setList: SetTagList, // 부모의 목록 상태 setter
    apiFunction: (payload: MasterDataType) => Promise<MasterDataType>
  ) => {
    // Enter 키가 아니거나 입력 값이 없으면 무시
    if (event.key !== "Enter" || input.trim() === "") {
      return;
    }

    event.preventDefault(); // 폼 기본 동작 방지
    const newName = input.trim();
    const payload: MasterDataType = { name: newName };

    // 즉시 실행 함수로 비동기 처리
    (async () => {
      try {
        const response = await apiFunction(payload);
        console.log(response);

        // 부모 컴포넌트의 상태 (departments) 갱신
        const newTag: TagItem = {
          id: response.id!,
          label: response.name || newName,
        };

        setList((prev) => [...prev, newTag]);

        // 입력 필드 초기화
        setInput("");
      } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
          const { status, data } = error.response;

          if (status === 400) {
            alert(data);
            return;
          }

          if (status === 401) return;
        }
        console.error("등록 실패:", error);
        alert("등록 중 오류가 발생했습니다.");
      }
    })();
  };

  return (
    <Box sx={{ mb: 4 }}>
      <Typography
        variant="h5"
        gutterBottom
        sx={{ fontWeight: 600, textAlign: "left" }}
      >
        기준 정보 관리
      </Typography>
      <Divider sx={{ mb: 2 }} />

      {/* 부서 등록 */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle1" sx={{ textAlign: "left", mb: 1 }}>
          부서
        </Typography>
        <TextField
          placeholder="Enter로 등록"
          variant="outlined"
          size="small"
          fullWidth
          value={departmentInput}
          onChange={(e) => setDepartmentInput(e.target.value)}
          onKeyDown={(e) =>
            handleAddTag(
              e,
              departmentInput,
              setDepartmentInput,
              setDepartments,
              createDepartment
            )
          }
        />

        <RenderChips list={departments} setList={setDepartments} />
      </Box>

      {/* 직급 등록 */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle1" sx={{ textAlign: "left", mb: 1 }}>
          직급
        </Typography>
        <TextField
          placeholder="Enter로 등록"
          variant="outlined"
          size="small"
          fullWidth
          value={jobPositionInput}
          onChange={(e) => setJobPositionInput(e.target.value)}
          onKeyDown={(e) =>
            handleAddTag(
              e,
              jobPositionInput,
              setJobPositionInput,
              setJobPositions,
              createJobPosition
            )
          }
        />

        <RenderChips list={jobPositions} setList={setJobPositions} />
      </Box>

      {/* 카테고리 등록 */}
      <Box>
        <Typography variant="subtitle1" sx={{ textAlign: "left", mb: 1 }}>
          카테고리
        </Typography>
        <TextField
          placeholder="Enter로 등록"
          variant="outlined"
          size="small"
          fullWidth
          value={categoryInput}
          onChange={(e) => setCategoryInput(e.target.value)}
          onKeyDown={(e) =>
            handleAddTag(
              e,
              categoryInput,
              setCategoryInput,
              setCategories,
              createCategory
            )
          }
        />
        <RenderChips list={categories} setList={setCategories} />
      </Box>
    </Box>
  );
}
