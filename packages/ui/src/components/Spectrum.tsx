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

type energyCountPair = {
  energy: number;
  count: number;
};

export type Input = {
  packets: string[];
  min_threshold: number;
  max_threshold: number;
  resolution: number;
};

export default function Spectrum({ data }: { data: Input }) {
  const size: number = 4;
  let channelList: string[] = [];
  let countArr: number[] = [];
  let chartData: energyCountPair[] = [];
  //Paketek szétválasztása
  for (const p of data.packets) {
    for (let i = 0; i < p.length; i += size) {
      channelList.push(String(p.slice(i, i + size)));
    }
  }

  //Egyes countok meghatározása
  let sum = 0;
  for (let k = 0; k < channelList.length; k++) {
    for (let j = 0; j < (channelList[k] ?? "").length; j++) {
      if (
        (channelList[k]?.charAt(j).charCodeAt(0) ?? -100) - "0".charCodeAt(0) >=
        10
      ) {
        sum +=
          ((channelList[k]?.charAt(j).charCodeAt(0) ?? -100) -
            "A".charCodeAt(0) +
            10) *
          Math.pow(16, 3 - j);
      } else {
        sum +=
          ((channelList[k]?.charAt(j).charCodeAt(0) ?? -100) -
            "0".charCodeAt(0)) *
          Math.pow(16, 3 - j);
      }
    }
    countArr.push(sum);
    sum = 0;
  }

  //Energiák meghatározása

  for (let c = 0; c < countArr.length; c++) {
    chartData.push({
      count: countArr[c] ?? -100,
      energy:
        data.min_threshold +
        c *
          Math.round(
            (data.max_threshold - data.min_threshold) / data.resolution,
          ),
    });
  }

  const chartConfig = {
    count: {
      label: "Count",
      color: "#F0B100",
    },
  } satisfies ChartConfig;

  return (
    <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
      <BarChart accessibilityLayer data={chartData}>
        <CartesianGrid vertical={true} stroke={"rgb(50, 50, 50)"} />
        <XAxis
          dataKey="energy"
          tickLine={true}
          tickMargin={10}
          axisLine={true}
          tickFormatter={(value) => value.toString()}
        />
        <YAxis tickLine={false} axisLine={false} tickMargin={8} />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Bar dataKey="count" fill="var(--color-count)" radius={4} />
      </BarChart>
    </ChartContainer>
  );
}
