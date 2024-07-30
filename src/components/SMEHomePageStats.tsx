"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bar, BarChart, XAxis, YAxis, CartesianGrid } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { getSMEStatsData } from "@/lib/api/stats";
import { useTheme } from "next-themes";

type ChartDataItem = {
  name: "Pending" | "Approved" | "Rejected";
  value: number;
};

type ChartConfig = {
  [key in ChartDataItem["name"]]: {
    label: string;
    color: string;
  };
};

export default function SMEHomePageStats({ smeId }: { smeId: string }) {
  const {
    data: stats,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["smeStats", smeId],
    queryFn: () => getSMEStatsData(smeId),
  });
  if (!stats) return <div>Error</div>;
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>An error occurred: {error.message}</div>;
  const darkMode = useTheme().resolvedTheme === "dark";

  const chartData: ChartDataItem[] = [
    { name: "Pending", value: stats.yesterdayStats.pending },
    { name: "Approved", value: stats.yesterdayStats.approved },
    { name: "Rejected", value: stats.yesterdayStats.rejected },
  ];

  const chartConfig: ChartConfig = {
    Pending: { label: "Pending", color: "#dc2626" },
    Approved: { label: "Approved", color: "hsl(120, 100%, 25%)" },
    Rejected: { label: "Rejected", color: "hsl(0, 72%, 51%)" },
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card>
        <CardHeader>
          <CardTitle>Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {stats.totalQuestionsSubmitted}
          </div>
          <p className="text-xs text-muted-foreground">
            Total questions submitted
          </p>
          <div className="mt-4 text-2xl font-bold">
            {stats.avgQuestionsPerDay}
          </div>
          <p className="text-xs text-muted-foreground">
            Average questions per day this month
          </p>
        </CardContent>
      </Card>

      <Card className="col-span-2">
        <CardHeader>
          <CardTitle>Yesterday's Stats</CardTitle>
        </CardHeader>
        <CardContent className="pl-2">
          <ChartContainer config={chartConfig} className="w-full aspect-[2/1]">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar
                dataKey="value"
                // @ts-ignore
                fill={darkMode ? "#ffffff" : "#000000"}
              />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}
