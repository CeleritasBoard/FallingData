"use client";
import * as React from "react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@workspace/ui/components/chart";
import { CHART_CONFIG, processData } from "./Spectrum.tsx";

export type energyCountPair = {
  energy: number;
  count: number;
};

export type Input = {
  packets: string[];
  min_threshold: number;
  max_threshold: number;
  resolution: number;
};

export default function SpectrumPreview({
  data,
  className,
}: {
  data: Input;
  className?: string;
}) {
  return (
    <ChartContainer
      config={CHART_CONFIG}
      className={`min-h-[200px] w-full ${className ?? ""}`}
    >
      <BarChart accessibilityLayer data={processData(data)}>
        <CartesianGrid vertical={true} stroke={"rgb(50, 50, 50)"} />
        <XAxis
          dataKey="energy"
          tickLine={true}
          tickMargin={10}
          axisLine={true}
          tickFormatter={(value) => value.toString()}
        />
        <Bar dataKey="count" fill="var(--color-count)" radius={4} />
      </BarChart>
    </ChartContainer>
  );
}
