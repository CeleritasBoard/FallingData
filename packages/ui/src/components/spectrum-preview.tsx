"use client";
import { Bar, BarChart, CartesianGrid, Label, XAxis } from "recharts";
import { ChartContainer } from "@workspace/ui/components/chart";
import { CHART_CONFIG, Input, processData } from "./Spectrum.tsx";

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
          tickFormatter={(value) => value.toFixed(2)}
          interval="preserveStart"
          minTickGap={100}
        >
          <Label value="keV" position="insideBottomRight" />
        </XAxis>

        <Bar dataKey="count" fill="var(--color-count)" radius={4} />
      </BarChart>
    </ChartContainer>
  );
}
