import React from "react";

interface ProgressDonutProps {
  percentage: number;
  label?: string;
  size?: number;
  strokeWidth?: number;
}

export function ProgressDonut({
  percentage,
  label = "Collected",
  size = 140,
  strokeWidth = 12,
}: ProgressDonutProps) {
  const cleanPercentage = Math.min(Math.max(percentage, 0), 100);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (cleanPercentage / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-slate-100 dark:text-slate-800 fill-transparent"
        />
        {/* Progress Arc */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="url(#donutGradient)"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out fill-transparent"
        />
        <defs>
          <linearGradient id="donutGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#059669" />
          </linearGradient>
        </defs>
      </svg>

      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
          {cleanPercentage}%
        </span>
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
          {label}
        </span>
      </div>
    </div>
  );
}
