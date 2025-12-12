// import { useState, useMemo } from "react";

// const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
// const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay(); // 0 (일) - 6 (토)

// const Calendar = () => {
//   const [currentDate, setCurrentDate] = useState(new Date(2025, 10, 1)); // 2025년 11월 시작
//   const today = useMemo(() => new Date(), []);

//   const year = currentDate.getFullYear();
//   const month = currentDate.getMonth();

//   const renderMonth = () => {
//     const firstDay = getFirstDayOfMonth(year, month);
//     const daysInMonth = getDaysInMonth(year, month);
//     const prevMonthDays = getDaysInMonth(year, month - 1);

//     let days = [];

//     // 1. 이전 달 날짜 채우기
//     for (let i = firstDay; i > 0; i--) {
//       const day = prevMonthDays - i + 1;
//       days.push({
//         day,
//         isCurrentMonth: false,
//         fullDate: new Date(year, month - 1, day).toISOString().slice(0, 10),
//       });
//     }

//     // 2. 현재 달 날짜 채우기
//     for (let i = 1; i <= daysInMonth; i++) {
//       const dateObj = new Date(year, month, i);
//       const isToday = dateObj.toDateString() === today.toDateString();
//       days.push({
//         day: i,
//         isCurrentMonth: true,
//         isToday,
//         fullDate: dateObj.toISOString().slice(0, 10),
//       });
//     }

//     // 3. 다음 달 날짜 채우기 (총 6주 = 42칸)
//     const remainingCells = 42 - days.length;
//     for (let i = 1; i <= remainingCells; i++) {
//       days.push({
//         day: i,
//         isCurrentMonth: false,
//         fullDate: new Date(year, month + 1, i).toISOString().slice(0, 10),
//       });
//     }

//     return days;
//   };

//   const days = useMemo(renderMonth, [year, month, today]);

//   const handlePrevMonth = () => {
//     setCurrentDate(new Date(year, month - 1, 1));
//   };

//   const handleNextMonth = () => {
//     setCurrentDate(new Date(year, month + 1, 1));
//   };

//   const formattedMonthYear = `${year}년 ${month + 1}월`;

//   const weekdays = ["일", "월", "화", "수", "목", "금", "토"];

//   return (
//     <div className="w-full max-w-4xl bg-white p-6 rounded-xl shadow-2xl">
//       {/* Header */}
//       <header className="flex justify-center items-center mb-6 gap-3">
//         <button
//           onClick={handlePrevMonth}
//           className="text-gray-600 hover:text-blue-500 text-xl p-2 rounded transition"
//         >
//           &lt;
//         </button>
//         <h2 className="text-2xl font-medium text-gray-800 tracking-wider">
//           {formattedMonthYear}
//         </h2>
//         <button
//           onClick={handleNextMonth}
//           className="text-gray-600 hover:text-blue-500 text-xl p-2 rounded transition"
//         >
//           &gt;
//         </button>
//       </header>

//       {/* Weekdays */}
//       <div className="grid grid-cols-7 text-center font-bold text-gray-600 border-b pb-2 mb-1">
//         {weekdays.map((day) => (
//           <span key={day}>{day}</span>
//         ))}
//       </div>

//       {/* Dates Grid */}
//       <div className="grid grid-cols-7 auto-rows-[120px] border-t border-l border-gray-200">
//         {days.map((dayData, index) => {
//           const events = eventsData[dayData.fullDate] || [];

//           // 오늘 날짜 스타일: 파란색 테두리
//           const todayStyle = dayData.isToday
//             ? "border-4 border-blue-500 p-0.5"
//             : "border-b border-r border-gray-200 p-2";

//           return (
//             <div
//               key={index}
//               className={`
//                                 relative h-full overflow-hidden text-sm box-border transition duration-150
//                                 ${todayStyle}
//                             `}
//               // 현재 월이 아닌 날짜는 배경을 약간 흐리게
//               style={{
//                 backgroundColor: dayData.isCurrentMonth ? "white" : "#f8f9fa",
//               }}
//             >
//               <span
//                 className={`
//                                     font-semibold text-lg mb-1 block
//                                     ${
//                                       dayData.isCurrentMonth
//                                         ? "text-gray-900"
//                                         : "text-gray-400"
//                                     }
//                                 `}
//               >
//                 {dayData.day}
//               </span>

//               {/* Events List */}
//               <div className="flex flex-col gap-1.5 pr-1">
//                 {events.map((event, eventIndex) => (
//                   <EventItem key={eventIndex} event={event} />
//                 ))}
//               </div>
//             </div>
//           );
//         })}
//       </div>
//     </div>
//   );
// };

// export default Calendar;
