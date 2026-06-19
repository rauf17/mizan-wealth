"use client";

import React from "react";
import { ZakatRecord } from "../types";

interface TrendChartProps {
  records: ZakatRecord[];
}

export default function TrendChart({ records }: TrendChartProps) {
  // Sort records chronologically (oldest to newest)
  const sortedRecords = [...records].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  if (sortedRecords.length === 0) {
    return (
      <div className="h-48 border border-dashed border-border/80 rounded-xl flex items-center justify-center text-muted-foreground text-sm bg-white">
        No history records available to plot trends.
      </div>
    );
  }

  // Chart SVG bounds settings
  const width = 600;
  const height = 180;
  const paddingX = 50;
  const paddingY = 25;

  const pointsCount = sortedRecords.length;

  // Extract Y-axis values
  const values = sortedRecords.map((r) => r.result.netZakatable);
  const maxVal = Math.max(...values, 1000); // Guard against zero max value
  const minVal = Math.min(...values, 0);

  const rangeY = maxVal - minVal;

  // Calculate coordinates for the line chart
  const points = sortedRecords.map((r, index) => {
    // Distribute points evenly along X axis
    const x =
      pointsCount > 1
        ? paddingX + (index * (width - 2 * paddingX)) / (pointsCount - 1)
        : width / 2;

    // Scale Y axis relative to max/min
    const y = height - paddingY - ((r.result.netZakatable - minVal) / rangeY) * (height - 2 * paddingY);

    return { x, y, record: r };
  });

  // Build the SVG path string for the line
  let linePath = "";
  let areaPath = "";

  if (points.length > 0) {
    linePath = `M ${points[0].x} ${points[0].y}`;
    areaPath = `M ${points[0].x} ${height - paddingY} L ${points[0].x} ${points[0].y}`;

    for (let i = 1; i < points.length; i++) {
      linePath += ` L ${points[i].x} ${points[i].y}`;
      areaPath += ` L ${points[i].x} ${points[i].y}`;
    }

    areaPath += ` L ${points[points.length - 1].x} ${height - paddingY} Z`;
  }

  return (
    <div className="space-y-4">
      {/* SVG Viewport */}
      <div className="w-full bg-white border border-border p-4 rounded-2xl shadow-sm overflow-hidden">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible">
          <defs>
            {/* Soft gradient fill below area path */}
            <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0F4C4C" stopOpacity="0.12" />
              <stop offset="100%" stopColor="#0F4C4C" stopOpacity="0.00" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          <line
            x1={paddingX}
            y1={paddingY}
            x2={width - paddingX}
            y2={paddingY}
            stroke="#E2E2D5"
            strokeWidth="1"
            strokeDasharray="4 4"
          />
          <line
            x1={paddingX}
            y1={height / 2}
            x2={width - paddingX}
            y2={height / 2}
            stroke="#E2E2D5"
            strokeWidth="1"
            strokeDasharray="4 4"
          />
          <line
            x1={paddingX}
            y1={height - paddingY}
            x2={width - paddingX}
            y2={height - paddingY}
            stroke="#E2E2D5"
            strokeWidth="1"
          />

          {/* Y Axis labels */}
          <text
            x={paddingX - 10}
            y={paddingY + 4}
            textAnchor="end"
            fontSize="10"
            className="fill-muted-foreground font-semibold"
          >
            ${Math.round(maxVal).toLocaleString()}
          </text>
          <text
            x={paddingX - 10}
            y={height / 2 + 4}
            textAnchor="end"
            fontSize="10"
            className="fill-muted-foreground font-semibold"
          >
            ${Math.round(minVal + rangeY / 2).toLocaleString()}
          </text>
          <text
            x={paddingX - 10}
            y={height - paddingY + 4}
            textAnchor="end"
            fontSize="10"
            className="fill-muted-foreground font-semibold"
          >
            ${Math.round(minVal).toLocaleString()}
          </text>

          {/* Filled Area Path */}
          {points.length > 1 && <path d={areaPath} fill="url(#areaGradient)" />}

          {/* Line Path */}
          {points.length > 1 && (
            <path d={linePath} fill="none" stroke="#0F4C4C" strokeWidth="2.5" strokeLinecap="round" />
          )}

          {points.map((pt) => {
            const date = new Date(pt.record.createdAt).toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
            });
            return (
              <g key={pt.record.id} className="group cursor-pointer">
                {/* Large invisible interactive hover target circle */}
                <circle cx={pt.x} cy={pt.y} r="12" fill="transparent" />
                {/* Visible dot */}
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r="4"
                  fill="#FFFFFF"
                  stroke="#0F4C4C"
                  strokeWidth="2.5"
                  className="transition-all group-hover:r-6"
                />
                {/* Date Label */}
                <text
                  x={pt.x}
                  y={height - paddingY + 16}
                  textAnchor="middle"
                  fontSize="9"
                  className="fill-muted-foreground font-semibold"
                >
                  {date}
                </text>
                {/* Value tooltip overlay displayed on hover (SVG title) */}
                <title>{`Date: ${date}\nNet Assets: $${pt.record.result.netZakatable.toLocaleString(
                  undefined,
                  { minimumFractionDigits: 2 }
                )}\nZakat: $${pt.record.result.zakatDue.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                })}`}</title>
              </g>
            );
          })}
        </svg>
      </div>
      <div className="text-[10px] text-muted-foreground text-center">
        * Hover over dots to view exact net asset declarations.
      </div>
    </div>
  );
}
