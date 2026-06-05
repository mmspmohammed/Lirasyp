// components/SparklineChart.tsx
"use client";

import { useMemo, useId } from "react";

interface SparklineChartProps {
  data: number[];
  color?: string;
  positive?: boolean;
  width?: number;
  height?: number;
  strokeWidth?: number;
}

export default function SparklineChart({
  data,
  color = "#3b82f6",
  positive = true,
  width = 140,
  height = 50,
  strokeWidth = 2,
}: SparklineChartProps) {
  const gradientId = useId();

  const { path, fillPath, viewBox } = useMemo(() => {
    if (data.length < 2) {
      return {
        path: "",
        fillPath: "",
        viewBox: `0 0 ${width} ${height}`,
      };
    }

    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    const padding = range * 0.1;
    const adjMin = min - padding;
    const adjMax = max + padding;
    const adjRange = adjMax - adjMin;

    const xStep = width / (data.length - 1);

    const points = data.map((val, i) => ({
      x: i * xStep,
      y: height - ((val - adjMin) / adjRange) * height,
    }));

    // مسار الخط
    const linePath = points
      .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
      .join(" ");

    // مسار التعبئة أسفل الخط
    const firstPoint = points[0];
    const lastPoint = points[points.length - 1];
    const areaPath = `${linePath} L ${lastPoint.x.toFixed(1)} ${height} L ${firstPoint.x.toFixed(1)} ${height} Z`;

    return {
      path: linePath,
      fillPath: areaPath,
      viewBox: `0 0 ${width} ${height}`,
    };
  }, [data, width, height]);

  if (data.length < 2) {
    return (
      <svg
        viewBox={viewBox}
        className="w-full h-full"
        preserveAspectRatio="none"
      >
        <line
          x1={0}
          y1={height / 2}
          x2={width}
          y2={height / 2}
          stroke={color}
          strokeWidth={1}
          strokeDasharray="4 4"
          opacity={0.5}
        />
      </svg>
    );
  }

  return (
    <svg
      viewBox={viewBox}
      className="w-full h-full"
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={color} stopOpacity={0.4} />
          <stop offset="100%" stopColor={color} stopOpacity={0.02} />
        </linearGradient>
      </defs>
      {/* منطقة التعبئة */}
      <path d={fillPath} fill={`url(#${gradientId})`} />
      {/* الخط */}
      <path
        d={path}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* نقطة النهاية */}
      {data.length > 0 && (() => {
        const lastIdx = data.length - 1;
        const xStep = width / (data.length - 1);
        const min = Math.min(...data);
        const max = Math.max(...data);
        const range = max - min || 1;
        const padding = range * 0.1;
        const adjMin = min - padding;
        const adjMax = max + padding;
        const adjRange = adjMax - adjMin;
        const lastY = height - ((data[lastIdx] - adjMin) / adjRange) * height;
        return (
          <circle
            cx={lastIdx * xStep}
            cy={lastY}
            r={3}
            fill={color}
            stroke="white"
            strokeWidth={1.5}
          />
        );
      })()}
    </svg>
  );
}
