"use client";

import { useState, useEffect } from "react";

interface RelativeTimeProps {
  dateString: string;
  className?: string;
  absolute?: boolean; // 절대시간 표시 여부
}

export default function RelativeTime({
  dateString,
  className = "",
  absolute = false,
}: RelativeTimeProps) {
  const [displayTime, setDisplayTime] = useState<string>("");
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);

    if (absolute) {
      // 절대시간 표시 (6월 22일 금요일 형식)
      const date = new Date(dateString);
      const month = date.getMonth() + 1;
      const day = date.getDate();
      const weekdays = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];
      const weekday = weekdays[date.getDay()];
      setDisplayTime(`${month}월 ${day}일 ${weekday}`);
    } else {
      // 상대시간 표시 (0일 전 형식)
      const updateTime = () => {
        const now = new Date();
        const postDate = new Date(dateString);
        const diffTime = now.getTime() - postDate.getTime();
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        
        setDisplayTime(`${diffDays}일 전`);
      };

      updateTime();
      const interval = setInterval(updateTime, 60000); // Update every minute

      return () => clearInterval(interval);
    }
  }, [dateString, absolute]);

  if (!isClient) {
    const date = new Date(dateString);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return (
      <span className={className}>{month}월 {day}일</span>
    );
  }

  return <span className={className}>{displayTime}</span>;
}
