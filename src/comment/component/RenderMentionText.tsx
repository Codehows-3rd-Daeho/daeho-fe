import type { Mention } from "../type/type";

export default function RenderMentionText(
  content: string,
  mentions: Mention[]
) {
  if (!mentions || mentions.length === 0) {
    return content;
  }

  // 멘션 이름 목록 (@ 포함 형태로)
  const mentionNames = mentions.map((m) => `@${m.name}`);

  // 정규식 생성 (@회원 10 | @회원 5 ...)
  const regex = new RegExp(`(${mentionNames.join("|")})`, "g");

  const parts = content.split(regex);

  return parts.map((part, idx) => {
    if (mentionNames.includes(part)) {
      return (
        <span key={idx} style={{ color: "#1976d2" }}>
          {part}
        </span>
      );
    }
    return <span key={idx}>{part}</span>;
  });
}
