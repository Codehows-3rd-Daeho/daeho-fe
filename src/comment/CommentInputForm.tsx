import React, { useState, type ChangeEvent, type MouseEvent } from "react";
import { CloudUpload } from "lucide-react";
import type { Attachment, NewCommentPayload } from "./type";

interface CommentInputFormProps {
  onAddComment: (payload: NewCommentPayload) => void;
  currentAuthor: string;
  currentAvatar: string;
}

const CommentInputForm: React.FC<CommentInputFormProps> = ({
  onAddComment,
  currentAuthor,
  currentAvatar,
}) => {
  const [content, setContent] = useState<string>("");
  const [attachedFiles, setAttachedFiles] = useState<Attachment[]>([]);

  // 파일 입력 핸들러
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (fileList) {
      // FileList를 Attachment 배열 타입으로 변환
      const newAttachments: Attachment[] = Array.from(fileList).map((file) => ({
        name: file.name,
        size: file.size,
        type: file.type,
      }));
      setAttachedFiles(newAttachments);
    }
  };

  // 저장 (댓글 등록) 핸들러
  const handleSave = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (content.trim() === "" && attachedFiles.length === 0) return;

    onAddComment({
      content: content,
      files: attachedFiles,
    });

    // 상태 초기화
    setContent("");
    setAttachedFiles([]);
  };

  // 취소 핸들러
  const handleCancel = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setContent("");
    setAttachedFiles([]);
  };

  const isSaveDisabled: boolean =
    content.trim() === "" && attachedFiles.length === 0;

  return (
    <div className="flex space-x-4 mb-8 p-6 border rounded-xl shadow-md bg-white">
      {/* 아바타/프로필 이미지 */}
      <div className="flex-shrink-0">
        <img
          src={currentAvatar}
          alt={currentAuthor}
          className="w-10 h-10 rounded-full object-cover border"
        />
      </div>

      {/* 입력 영역 */}
      <div className="flex-grow">
        <div className="mb-4">
          <textarea
            className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-blue-500 focus:border-blue-500"
            rows={4}
            placeholder="내용을 입력해주세요"
            value={content}
            onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
              setContent(e.target.value)
            }
          />
        </div>

        {/* 파일 첨부 영역 */}
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer mb-6 relative hover:bg-gray-50 transition">
          <input
            type="file"
            multiple
            onChange={handleFileChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <CloudUpload className="w-10 h-10 mx-auto text-gray-400 mb-2" />
          <p className="text-gray-600 text-sm mb-1">
            등록 가능한 파일 형식: JPG, PNG, CSV / 총 업로드 용량 50MB 이하
          </p>
          <button
            type="button"
            className="px-4 py-1.5 bg-gray-200 text-gray-700 rounded-md font-semibold hover:bg-gray-300 transition mt-2"
            onClick={(e) => e.preventDefault()} // 파일 입력 필드를 클릭하도록 유도
          >
            Browse files
          </button>

          {/* 첨부 파일 이름 표시 */}
          {attachedFiles.length > 0 && (
            <div className="mt-3 text-left text-xs text-gray-700">
              **첨부된 파일:** {attachedFiles.map((f) => f.name).join(", ")}
            </div>
          )}
        </div>

        {/* 저장/취소 버튼 */}
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={handleCancel}
            className="px-6 py-2 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-100 transition duration-200"
          >
            취소
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition duration-200"
            disabled={isSaveDisabled}
          >
            저장
          </button>
        </div>
      </div>
    </div>
  );
};

export default CommentInputForm;
