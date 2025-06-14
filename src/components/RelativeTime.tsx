'use client';

import { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/ko';

dayjs.extend(relativeTime);
dayjs.locale('ko');

interface RelativeTimeProps {
  dateString: string;
  className?: string;
}

export default function RelativeTime({ dateString, className = "" }: RelativeTimeProps) {
  const [timeAgo, setTimeAgo] = useState<string>('');
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const updateTime = () => {
      setTimeAgo(dayjs(dateString).fromNow());
    };

    updateTime();
    const interval = setInterval(updateTime, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [dateString]);

  if (!isClient) {
    return <span className={className}>{dayjs(dateString).format('M월 D일')}</span>;
  }

  return <span className={className}>{timeAgo}</span>;
}