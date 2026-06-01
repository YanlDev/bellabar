"use client";

import { createContext, useContext } from "react";
import { cn } from "@/lib/utils";

const ChartContext = createContext<{ config: Record<string, { label: string; color: string }> }>({
  config: {},
});

const chartColors = {
  gold: "oklch(0.72 0.12 85)",
  amber: "oklch(0.35 0.07 80)",
  emerald: "oklch(0.6 0.1 155)",
  rose: "oklch(0.62 0.12 22)",
  violet: "oklch(0.28 0.04 270)",
  teal: "oklch(0.5 0.06 180)",
};

export type ChartConfig = Record<string, { label: string; color?: string }>;

export function ChartContainer({
  config,
  className,
  children,
}: {
  config: ChartConfig;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <ChartContext.Provider value={{ config: config as Record<string, { label: string; color: string }> }}>
      <div className={cn("w-full", className)}>{children}</div>
    </ChartContext.Provider>
  );
}

export function ChartTooltip({ content }: { content: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-[oklch(0.2_0.004_80)] bg-[oklch(0.17_0.003_85)] px-3 py-2 text-xs text-[oklch(0.82_0.005_78)] shadow-xl">
      {content}
    </div>
  );
}

export function getChartColor(key: string) {
  return chartColors[key as keyof typeof chartColors] || "oklch(0.72 0.12 85)";
}
