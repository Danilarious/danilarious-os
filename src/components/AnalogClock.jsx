// src/components/AnalogClock.jsx
import { useState, useEffect } from "react";

export function AnalogClock() {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const hours = now.getHours();
  const minutes = now.getMinutes();
  const seconds = now.getSeconds();

  const minuteAngle = (minutes + seconds / 60) * 6;
  const hourAngle = ((hours % 12) + minutes / 60) * 30;

  const tickColors = [
    "#EFAB96",
    "#FBAD26",
    "#567DBE",
    "#E69824",
    "#EBA5AD",
    "#56B57F",
    "#E7BD3D",
    "#6E86C2",
    "#EB784B",
    "#D5757F",
    "#7DB4A6",
    "#6598AC",
  ];

  const ticks = Array.from({ length: 12 }, (_, i) => {
    const angle = (i / 12) * 2 * Math.PI;
    const inner = 34;
    const outer = 44;
    const x1 = 50 + inner * Math.cos(angle);
    const y1 = 50 + inner * Math.sin(angle);
    const x2 = 50 + outer * Math.cos(angle);
    const y2 = 50 + outer * Math.sin(angle);
    return { x1, y1, x2, y2, color: tickColors[i % tickColors.length], i };
  });

  return (
    <div className="w-10 h-10">
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <circle
          cx="50"
          cy="50"
          r="47"
          fill="#fffdf8"
          stroke="#000000"
          strokeWidth="2.5"
        />

        {ticks.map((t) => (
          <line
            key={t.i}
            x1={t.x1}
            y1={t.y1}
            x2={t.x2}
            y2={t.y2}
            stroke={t.color}
            strokeWidth="2.6"
            strokeLinecap="round"
          />
        ))}

        <line
          x1="50"
          y1="50"
          x2="50"
          y2="30"
          stroke="#2D2726"
          strokeWidth="4"
          strokeLinecap="round"
          transform={`rotate(${hourAngle} 50 50)`}
        />

        <line
          x1="50"
          y1="50"
          x2="50"
          y2="22"
          stroke="#FBAD26"
          strokeWidth="3"
          strokeLinecap="round"
          transform={`rotate(${minuteAngle} 50 50)`}
        />

        <circle cx="50" cy="50" r="2.7" fill="#000000" />
      </svg>
    </div>
  );
}
