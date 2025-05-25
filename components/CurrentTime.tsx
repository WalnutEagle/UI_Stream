
import React, { useState, useEffect } from 'react';

export const CurrentTime: React.FC<{className?: string}> = ({ className }) => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timerId = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(timerId);
  }, []);

  return (
    <div className={`text-sm font-medium tabular-nums ${className || 'text-gray-100'}`}>
      {time.toLocaleTimeString()}
    </div>
  );
};
