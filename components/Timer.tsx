import React, { useEffect, useMemo, useState } from "react";

const Timer: React.FC<{ initialTime: number; onExpire?: () => void; isRunning?: boolean }> = ({
  initialTime,
  onExpire,
  isRunning = true,
}) => {
  const [timeLeft, setTimeLeft] = useState(initialTime);

  useEffect(() => {
    if (!isRunning || timeLeft <= 0) {
      return;
    }

    const timerId = window.setInterval(() => {
      setTimeLeft((prev) => Math.max(prev - 1, 0));
    }, 1000);

    return () => window.clearInterval(timerId);
  }, [isRunning, timeLeft]);

  useEffect(() => {
    if (timeLeft === 0) {
      onExpire?.();
    }
  }, [onExpire, timeLeft]);

  const formattedTime = useMemo(() => {
    const hours = Math.floor(timeLeft / 3600);
    const minutes = Math.floor((timeLeft % 3600) / 60);
    const seconds = timeLeft % 60;
    return [hours, minutes, seconds].map((value) => String(value).padStart(2, "0")).join(":");
  }, [timeLeft]);

  return (
    <div className="rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Time left</p>
      <p className="mt-1 font-mono text-2xl font-bold text-slate-950">{formattedTime}</p>
    </div>
  );
};

export default Timer;
