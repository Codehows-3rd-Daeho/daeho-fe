import React from "react";
import { FileText } from "lucide-react";
import type { CommentData } from "./type/type";

interface CommentItemProps {
  comment: CommentData;
}

const CommentItem: React.FC<CommentItemProps> = ({ comment }) => {
  const { author, content, timestamp, files } = comment;

  // 파일 크기를 MB 단위로 포맷팅하는 유틸리티 함수
  const formatFileSize = (size: number): string => {
    return (size / 1024 / 1024).toFixed(2);
  };

  return (
    <div className="flex space-x-4 border-b pb-4">
      {/* 아바타 영역 */}
      <div className="flex-shrink-0">
        <div className="w-10 h-10 bg-gray-400 rounded-full flex items-center justify-center text-white font-bold text-lg">
          {author.charAt(0)}
        </div>
      </div>

      {/* 내용 영역 */}
      <div className="flex-grow">
        <div className="flex items-center space-x-2 mb-1">
          <span className="font-semibold text-gray-800">{author}</span>
          <span className="text-sm text-gray-500">{timestamp}</span>
        </div>
        <p className="text-gray-700 leading-relaxed whitespace-pre-wrap mb-2">
          {content}
        </p>

        {/* 첨부 파일 목록 표시 */}
        {files && files.length > 0 && (
          <div className="mt-3 space-y-1">
            {files.map((file, index) => (
              <div
                key={index}
                className="flex items-center text-sm text-blue-600 bg-blue-50 p-2 rounded-md hover:bg-blue-100 transition cursor-pointer"
              >
                <FileText className="w-4 h-4 mr-2" />
                <span>{file.name}</span>
                <span className="ml-auto text-xs text-gray-500">
                  ({formatFileSize(file.size)} MB)
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CommentItem;
