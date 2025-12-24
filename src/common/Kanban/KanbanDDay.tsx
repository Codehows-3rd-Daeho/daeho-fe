// D-Day 및 마감 임박 여부를 계산하는 함수
export const calculateDDay = (endDate: string) => {
  const today = new Date();
  const end = new Date(endDate);

  // 날짜만 비교하여 D-Day 계산
  const diffTime = end.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  // 마감 임박: D-Day가 0이거나 1일 이하
  const isImminent = diffDays <= 1 && diffDays >= 0;

  return { dDay: diffDays, isImminent };
};
