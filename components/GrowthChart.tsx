"use client";

import React from "react";
import { GrowthProjectionYear } from "../types";

interface GrowthChartProps {
  data: GrowthProjectionYear[];
}

export default function GrowthChart({ data }: GrowthChartProps) {
  if (data.length === 0) {
    return (
      <div className="h-48 border border-dashed border-border/80 rounded-xl flex items-center justify-center text-muted-foreground text-sm bg-white">
        Adjust parameters to generate growth projections.
      </div>
    );
  }

  // Chart layout dimensions
  const width = 600;
  const height = 180;
  const paddingX = 50;
  const paddingY = 25;

  const pointsCount = data.length;

  // Extract values
  const values = data.map((d) => d.endingBalance);
  const maxVal = Math.max(...values, 1000);
  const minVal = Math.min(...data.map((d) => d.startingBalance), 0);

  const rangeY = maxVal - minVal;

  const points = data.map((d, index) => {
    const x =
      pointsCount > 1
        ? paddingX + (index * (width - 2 * paddingX)) / (pointsCount - 1)
        : width / 2;

    const y = height - paddingY - ((d.endingBalance - minVal) / rangeY) * (height - 2 * paddingY);

    return { x, y, data: d };
  });

  // Build SVG Paths
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
      <div className="w-full bg-white border border-border p-4 rounded-2xl shadow-sm overflow-hidden">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible">
          <defs>
            {/* Gold area gradient */}
            <linearGradient id="goldAreaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#C9A227" stopOpacity="0.12" />
              <stop offset="100%" stopColor="#C9A227" stopOpacity="0.00" />
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

          {/* Area Path */}
          {points.length > 1 && <path d={areaPath} fill="url(#goldAreaGradient)" />}

          {/* Line Path */}
          {points.length > 1 && (
            <path d={linePath} fill="none" stroke="#C9A227" strokeWidth="2.5" strokeLinecap="round" />
          )}

          {/* Points & Tooltips */}
          {points.map((pt, index) => {
            // Only show labels every few years to keep graph clean
            const shouldShowLabel = pointsCount <= 10 || index === 0 || index === pointsCount - 1 || index % 3 === 0;

            return (
              <g key={index} className="group cursor-pointer">
                <circle cx={pt.x} cy={pt.y} r="12" fill="transparent" />
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r="3.5"
                  fill="#FFFFFF"
                  stroke="#C9A227"
                  strokeWidth="2"
                />
                
                {shouldShowLabel && (
                  <text
                    x={pt.x}
                    y={height - paddingY + 16}
                    textAnchor="middle"
                    fontSize="9"
                    className="fill-muted-foreground font-semibold"
                  >
                    Yr {pt.data.year}
                  </text>
                )}

                <title>
                  {`Year ${pt.data.year}
Starting Balance: $${Math.round(pt.data.startingBalance).toLocaleString()}
Contributions: +$${Math.round(pt.data.contributions).toLocaleString()}
Investment Gains: +$${Math.round(pt.data.investmentGains).toLocaleString()}
Zakat Deducted (2.5%): -$${Math.round(pt.data.zakatDeducted).toLocaleString()}
Purification Rate: -$${Math.round(pt.data.purifiedDeducted).toLocaleString()}
Ending Balance: $${Math.round(pt.data.endingBalance).toLocaleString()}`}
                </title>
              </g>
            );
          })}
        </svg>
      </div>
      <div className="text-[10px] text-muted-foreground text-center">
        * Hover over dots to view compound return and Zakat deductions year-by-year.
      </div>
    </div>
  );
}
