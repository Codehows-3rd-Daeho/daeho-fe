// src/components/CommentSection.tsx

import React, { useState } from "react";
import CommentInputForm from "./CommentInputForm";
import CommentItem from "./CommentItem";
import type { CommentData, NewCommentPayload } from "./type";

// 초기 댓글 데이터 (CommentData 타입 적용)
const initialComments: CommentData[] = [
  {
    id: 1,
    author: "사용자A",
    content: "TSX로 변환 깔끔하네요!",
    timestamp: "2025.12.10 10:00",
    files: [],
  },
  {
    id: 2,
    author: "ReactDev",
    content: "타입스크립트 적용 감사합니다.",
    timestamp: "2025.12.10 11:30",
    files: [],
  },
];

const CommentSection: React.FC = () => {
  const [comments, setComments] = useState<CommentData[]>(initialComments);
  const currentAuthor: string = "새 사용자";
  const currentAvatar: string = "/avatar-placeholder.jpg";

  // 댓글 추가 핸들러
  const handleAddComment = (payload: NewCommentPayload) => {
    const newCommentObject: CommentData = {
      id: Date.now(),
      author: currentAuthor,
      content: payload.content,
      files: payload.files,
      timestamp: new Date()
        .toLocaleString("ko-KR", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
        })
        .replace(/\. /g, ".")
        .replace(":", ":")
        .replace(/\./g, ".")
        .slice(0, -3),
    };

    setComments([newCommentObject, ...comments]);
  };

  return (
    <div className="max-w-4xl mx-auto p-4 bg-gray-100">
      {/* 상단 원본 게시글 영역 (이미지에서 보이는 형태) */}
      <div className="p-6 bg-white shadow-lg rounded-lg mb-8 border-b">
        <div className="flex space-x-3 items-start">
          <img
            src="/avatar-hong.jpg"
            alt="홍길동 대리"
            className="w-10 h-10 rounded-full object-cover"
          />
          <div>
            <span className="font-semibold text-gray-800">홍길동 대리</span>
            <p className="text-gray-700 mt-1 mb-2">
              게시글 내용... (댓글을 위한 컨텍스트)
            </p>
            <span className="text-sm text-gray-500">2025.11.11 15:32</span>
          </div>
        </div>
      </div>

      <h2 className="text-xl font-bold mb-6 border-b pb-2 text-gray-700">
        댓글 ({comments.length})
      </h2>

      {/* 댓글 입력 폼 */}
      <CommentInputForm
        onAddComment={handleAddComment}
        currentAuthor={currentAuthor}
        currentAvatar={currentAvatar}
      />

      {/* 댓글 목록 */}
      <div className="space-y-6">
        {comments.map((comment) => (
          // key prop에 number 타입이 보장됨 (comment.id)
          <CommentItem key={comment.id} comment={comment} />
        ))}
      </div>
    </div>
  );
};

export default CommentSection;
