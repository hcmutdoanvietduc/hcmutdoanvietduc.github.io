import React, { useEffect, useRef, useState } from "react";
import "./App.css";

type TimerKey = "hoc" | "nghi" | "khac";

interface TimerData {
  hoc: number;
  nghi: number;
  khac: number;
  active: TimerKey | null;
  lastDate: string;
}

const initialTimes = {
  hoc: 12 * 60 * 60,
  nghi: 8 * 60 * 60,
  khac: 4 * 60 * 60,
};

function App() {
  const [timers, setTimers] = useState<TimerData>(() => {
    const saved = localStorage.getItem("timers");
    const today = new Date().toDateString();

    if (saved) {
      const parsed: TimerData = JSON.parse(saved);
      if (parsed.lastDate === today) {
        return parsed;
      }
    }

    // Reset nếu qua ngày mới
    return {
      ...initialTimes,
      hoc: initialTimes.hoc,
      nghi: initialTimes.nghi,
      khac: initialTimes.khac,
      active: "nghi",
      lastDate: today,
    };
  });

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Cập nhật localStorage mỗi khi timers thay đổi
  useEffect(() => {
    localStorage.setItem("timers", JSON.stringify(timers));
  }, [timers]);

  // Chạy timer
  useEffect(() => {
    if (timers.active) {
      timerRef.current = setInterval(() => {
        setTimers((prev) => {
          const current = prev[timers.active!];
          if (current > 0) {
            return { ...prev, [timers.active!]: current - 1 };
          } else {
            return { ...prev, active: null };
          }
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [timers.active]);

  const formatTime = (secs: number) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return `${h.toString().padStart(2, "0")}:${m
      .toString()
      .padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const startTimer = (key: TimerKey) => {
    setTimers((prev) => ({ ...prev, active: key }));
  };

  return (
    <div className="container">
      <h1>⏱ My Timer App</h1>

      <div>
        <div className="timer">Học: {formatTime(timers.hoc)}</div>
        <button
          className={timers.active === "hoc" ? "active" : ""}
          onClick={() => startTimer("hoc")}
        >
          Chạy Học (12h)
        </button>
      </div>

      <div>
        <div className="timer">Nghỉ ngơi: {formatTime(timers.nghi)}</div>
        <button
          className={timers.active === "nghi" ? "active" : ""}
          onClick={() => startTimer("nghi")}
        >
          Chạy Nghỉ ngơi (8h)
        </button>
      </div>

      <div>
        <div className="timer">Khác: {formatTime(timers.khac)}</div>
        <button
          className={timers.active === "khac" ? "active" : ""}
          onClick={() => startTimer("khac")}
        >
          Chạy Khác (4h)
        </button>
      </div>
    </div>
  );
}

export default App;
