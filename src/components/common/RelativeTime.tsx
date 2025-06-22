"use client";

import { useState, useEffect } from "react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/ko";

dayjs.extend(relativeTime);
dayjs.locale("ko");

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
      // 절대시간 표시 (6월 22일 (금) 형식)
      const date = dayjs(dateString);
      setDisplayTime(date.format("M월 D일 ddd요일"));
    } else {
      // 상대시간 표시 (2일 전 형식)
      const updateTime = () => {
        setDisplayTime(dayjs(dateString).fromNow());
      };

      updateTime();
      const interval = setInterval(updateTime, 60000); // Update every minute

      return () => clearInterval(interval);
    }
  }, [dateString, absolute]);

  if (!isClient) {
    return (
      <span className={className}>{dayjs(dateString).format("M월 D일")}</span>
    );
  }

  return <span className={className}>{displayTime}</span>;
}
